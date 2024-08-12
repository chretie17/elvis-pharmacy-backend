const db = require('../models/db');

// Get all inventory items with filtering for low stock or expired items
exports.getAllInventory = (req, res) => {
    const { filter } = req.query; // filter can be 'low_stock' or 'expired'
    
    let query = 'SELECT * FROM inventory';
    
    if (filter === 'low_stock') {
        query += ' WHERE quantity <= 3';  // Adjust the threshold value as needed
    } else if (filter === 'expired') {
        query += ' WHERE expiration_date < CURDATE()';
    }
    
    db.query(query, (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    });
};

// Get a specific inventory item by ID with additional logic for stock validation
exports.getInventoryItemById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM inventory WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        
        const item = results[0];
        
        if (item) {
            // Check if the item is out of stock
            if (item.quantity === 0) {
                item.status = 'Out of Stock';
            }
            
            // Check if the item is expired
            if (new Date(item.expiration_date) < new Date()) {
                item.status = 'Expired';
            }
        }
        
        res.status(200).json(item);
    });
};

// Add a new inventory item with validation checks
exports.addInventoryItem = (req, res) => {
    const { name, manufacturer, type, quantity, expiration_date } = req.body;
    
    if (!name || !manufacturer || !type || !quantity || !expiration_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    const query = 'INSERT INTO inventory (name, manufacturer, type, quantity, expiration_date) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, manufacturer, type, quantity, expiration_date], (err, results) => {
        if (err) throw err;
        res.status(201).json({ message: 'Inventory item added successfully!' });
    });
};

// Update an inventory item by ID with stock adjustment logic and automatic ordering
// Update an inventory item by ID with stock adjustment logic and automatic ordering
// Update an inventory item by ID with stock adjustment logic and automatic ordering
exports.updateInventoryItem = (req, res) => {
    const { id } = req.params;
    const { name, manufacturer, type, quantity, expiration_date } = req.body;
    
    if (!name || !manufacturer || !type || !quantity || !expiration_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    const query = 'UPDATE inventory SET name = ?, manufacturer = ?, type = ?, quantity = ?, expiration_date = ? WHERE id = ?';
    db.query(query, [name, manufacturer, type, quantity, expiration_date, id], (err, results) => {
        if (err) {
            console.error('Error updating inventory item:', err);
            return res.status(500).json({ message: 'Error updating inventory item' });
        }

        // Check if quantity is below threshold and create an automatic order if necessary
        const threshold = 3; // Adjust the threshold value as needed
        if (quantity < threshold) {
            const neededQuantity = threshold - quantity;
            const orderQuery = 'INSERT INTO orders (inventory_id, order_quantity, order_date, status) VALUES (?, ?, NOW(), ?)';
            const orderQuantity = neededQuantity; // Order exactly what is needed to reach the threshold
            const orderStatus = 'Pending';
            
            db.query(orderQuery, [id, orderQuantity, orderStatus], (orderErr, orderResults) => {
                if (orderErr) {
                    console.error('Error creating order:', orderErr);
                    return res.status(500).json({ message: 'Error creating order' });
                }
                console.log(`Automatic order created for item ID ${id}`);
                res.status(200).json({ message: 'Inventory item updated successfully!' });
            });
        } else {
            // If no order needed, respond with success
            res.status(200).json({ message: 'Inventory item updated successfully!' });
        }
    });
};

// Delete an inventory item by ID with additional validation for stock
exports.deleteInventoryItem = (req, res) => {
    const { id } = req.params;
    
    // Ensure that item does not have any pending orders
    db.query('SELECT * FROM orders WHERE inventory_id = ? AND status = "Pending"', [id], (err, results) => {
        if (err) throw err;
        
        if (results.length > 0) {
            return res.status(400).json({ message: 'Cannot delete item with pending orders' });
        }
        
        const deleteQuery = 'DELETE FROM inventory WHERE id = ?';
        db.query(deleteQuery, [id], (deleteErr, deleteResults) => {
            if (deleteErr) throw deleteErr;
            res.status(200).json({ message: 'Inventory item deleted successfully!' });
        });
    });
};
