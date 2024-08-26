const db = require('../models/db');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
    try {
        const query = 'SELECT * FROM suppliers';
        const results = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve suppliers' });
    }
};

// Create a new supplier
exports.createSupplier = async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    try {
        const query = 'INSERT INTO suppliers (name, email) VALUES (?, ?)';
        await db.query(query, [name, email]);
        res.status(201).json({ message: 'Supplier created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create supplier' });
    }
};

// Update a supplier
exports.updateSupplier = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    try {
        const query = 'UPDATE suppliers SET name = ?, email = ? WHERE id = ?';
        const results = await db.query(query, [name, email, id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.status(200).json({ message: 'Supplier updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update supplier' });
    }
};

// Delete a supplier
exports.deleteSupplier = async (req, res) => {
    const { id } = req.params;

    try {
        const results = await db.query('DELETE FROM suppliers WHERE id = ?', [id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.status(200).json({ message: 'Supplier deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete supplier' });
    }
};
