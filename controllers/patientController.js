const db = require('../models/db');

// Add a new patient with insurance and prescription details
exports.addPatient = async (req, res) => {
    const { name, national_id, prescription, allergies, insurance_id, age } = req.body;

    if (!name || !national_id || national_id.length !== 16 || !prescription || !insurance_id || !age) {
        return res.status(400).json({ message: 'Name, 16-character national ID, prescription, insurance, and age are required' });
    }

    try {
        const parsedPrescription = JSON.parse(prescription);

        // Validate stock and age restrictions before proceeding
        for (let item of parsedPrescription) {
            const [inventoryItem] = await db.query('SELECT quantity, name, age_allowed_min, age_allowed_max FROM inventory WHERE id = ?', [item.id]);

            if (!inventoryItem) {
                return res.status(400).json({ message: `Medicine with ID ${item.id} not found in inventory.` });
            }

            if (inventoryItem.quantity === 0) {
                return res.status(400).json({ message: `Medicine ${inventoryItem.name} is out of stock.` });
            }

            if (item.quantity > inventoryItem.quantity) {
                return res.status(400).json({ message: `Medicine ${inventoryItem.name} has only ${inventoryItem.quantity} units available. You requested ${item.quantity} units.` });
            }

            // Age validation
            if (age < inventoryItem.age_allowed_min || age > inventoryItem.age_allowed_max) {
                return res.status(400).json({ message: `Medicine ${inventoryItem.name} is not allowed for patients of age ${age}.` });
            }
        }

        // Calculate total cost based on the medicines in the prescription
        const totalCost = await calculateTotalCost(parsedPrescription);

        // Deduct medicine quantities from inventory and create orders if necessary
        for (let item of parsedPrescription) {
            await db.query('UPDATE inventory SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.id]);

            const [updatedItem] = await db.query('SELECT quantity, name FROM inventory WHERE id = ?', [item.id]);
            if (updatedItem.quantity < 0) {
                throw new Error(`Insufficient stock for medicine with ID ${item.id}`);
            }

            // If the quantity is below the threshold, create a new order and send notification
            if (updatedItem.quantity < 3) {
                const orderQuantity = 3 - updatedItem.quantity;
                const orderQuery = 'INSERT INTO orders (inventory_id, order_quantity, order_date, status) VALUES (?, ?, NOW(), ?)';
                await db.query(orderQuery, [item.id, orderQuantity, 'Pending']);

                // Send notification for low stock and order creation
                await db.query('INSERT INTO notifications (message) VALUES (?)', [`Automatic order created for ${updatedItem.name} due to low stock.`]);
            }
        }

        const insurance = await db.query('SELECT * FROM insurances WHERE id = ?', [insurance_id]);
        if (insurance.length === 0) {
            return res.status(400).json({ message: 'Invalid insurance' });
        }
        const coverageRate = insurance[0].coverage_rate;
        const finalCost = totalCost * (1 - coverageRate / 100);

        // Insert patient into the database
        const query = 'INSERT INTO patients (name, national_id, prescription, allergies, insurance_id, total_cost, final_cost, age) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await db.query(query, [name, national_id, prescription, allergies, insurance_id, totalCost, finalCost, age]);

        // Send notification for patient addition
        await db.query('INSERT INTO notifications (message) VALUES (?)', [`Patient ${name} added successfully.`]);

        res.status(201).json({ message: 'Patient added successfully!', totalCost, finalCost });
    } catch (err) {
        console.error('Error adding patient:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



// Update a patient with insurance details and prescription
exports.updatePatient = async (req, res) => {
    const { id } = req.params;
    const { name, national_id, prescription, allergies, insurance_id } = req.body;

    // Validate inputs
    if (!name || !national_id || national_id.length !== 16 || !prescription || !insurance_id) {
        return res.status(400).json({ message: 'Name, 16-character national ID, prescription, and insurance are required' });
    }

    try {
        // Recalculate total cost and final cost based on the updated prescription
        const totalCost = await calculateTotalCost(JSON.parse(prescription));
        const insurance = await db.query('SELECT * FROM insurances WHERE id = ?', [insurance_id]);
        const coverageRate = insurance[0].coverage_rate;
        const finalCost = totalCost * (1 - coverageRate / 100);

        const query = 'UPDATE patients SET name = ?, national_id = ?, prescription = ?, allergies = ?, insurance_id = ?, total_cost = ?, final_cost = ? WHERE id = ?';
        await db.query(query, [name, national_id, prescription, allergies, insurance_id, totalCost, finalCost, id]);
        res.status(200).json({ message: 'Patient updated successfully!', totalCost, finalCost });
    } catch (err) {
        console.error('Error updating patient:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Other existing methods remain the same...

// Get all patients with their associated insurance
exports.getAllPatients = async (req, res) => {
    try {
        const results = await db.query('SELECT p.*, i.name as insurance_name FROM patients p LEFT JOIN insurances i ON p.insurance_id = i.id');
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ message: 'Failed to retrieve patients' });
    }
};

// Get a specific patient by ID with insurance details
exports.getPatientById = async (req, res) => {
    const { id } = req.params;
    try {
        const results = await db.query('SELECT p.*, i.name as insurance_name FROM patients p LEFT JOIN insurances i ON p.insurance_id = i.id WHERE p.id = ?', [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Error fetching patient:', err);
        res.status(500).json({ message: 'Failed to retrieve patient' });
    }
};

// Delete a patient by ID
exports.deletePatient = async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'DELETE FROM patients WHERE id = ?';
        await db.query(query, [id]);
        res.status(200).json({ message: 'Patient deleted successfully!' });
    } catch (err) {
        console.error('Error deleting patient:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllInsurances = async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM insurances');
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching insurances:', err);
        res.status(500).json({ message: 'Failed to retrieve insurances' });
    }
};

// Helper function to calculate total cost based on the prescription
async function calculateTotalCost(prescription) {
    let totalCost = 0;
    for (let item of prescription) {
        const medicine = await db.query('SELECT price FROM inventory WHERE id = ?', [item.id]);
        if (medicine.length > 0) {
            totalCost += medicine[0].price * item.quantity;
        } else {
            throw new Error(`Medicine with ID ${item.id} not found in inventory`);
        }
    }
    return totalCost;
}
