const db = require('../models/db');

// Get all inventory items with filtering for low stock or expired items
exports.getAllInventory = async (req, res) => {
    try {
        const { filter } = req.query; // filter can be 'low_stock' or 'expired'
        
        let query = 'SELECT * FROM inventory';
        
        if (filter === 'low_stock') {
            query += ' WHERE quantity <= 3';  // Adjust the threshold value as needed
        } else if (filter === 'expired') {
            query += ' WHERE expiration_date < CURDATE()';
        }
        
        const results = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a specific inventory item by ID with additional logic for stock validation
exports.getInventoryItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const results = await db.query('SELECT * FROM inventory WHERE id = ?', [id]);
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const item = results[0];
        
        if (item.quantity === 0) {
            item.status = 'Out of Stock';
        }
        
        if (new Date(item.expiration_date) < new Date()) {
            item.status = 'Expired';
        }
        
        res.status(200).json(item);
    } catch (err) {
        console.error('Error fetching inventory item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add a new inventory item with validation checks
exports.addInventoryItem = async (req, res) => {
    try {
        const { name, manufacturer, type, quantity, expiration_date, price } = req.body;
        
        if (!name || !manufacturer || !type || !quantity || !expiration_date || !price) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const query = 'INSERT INTO inventory (name, manufacturer, type, quantity, expiration_date, price) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(query, [name, manufacturer, type, quantity, expiration_date, price]);
        res.status(201).json({ message: 'Inventory item added successfully!' });
    } catch (err) {
        console.error('Error adding inventory item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update an inventory item by ID with stock adjustment logic and automatic ordering
exports.updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, manufacturer, type, quantity, expiration_date, price } = req.body;

        if (!name || !manufacturer || !type || !quantity || !expiration_date || !price) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const updateQuery = 'UPDATE inventory SET name = ?, manufacturer = ?, type = ?, quantity = ?, expiration_date = ?, price = ? WHERE id = ?';
        const results = await db.query(updateQuery, [name, manufacturer, type, quantity, expiration_date, price, id]);

        if (results.affectedRows > 0) {
            if (quantity < 3) {
                const orderQuantity = 3 - quantity;
                const orderQuery = 'INSERT INTO orders (inventory_id, order_quantity, order_date, status) VALUES (?, ?, NOW(), ?)';
                await db.query(orderQuery, [id, orderQuantity, 'Pending']);
                res.status(200).json({ message: 'Inventory item updated and automatic order created successfully!' });
            } else {
                res.status(200).json({ message: 'Inventory item updated successfully!' });
            }
        } else {
            res.status(400).json({ message: 'No changes were made to the inventory item' });
        }
    } catch (err) {
        console.error('Error updating inventory item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete an inventory item by ID with additional validation for stock
exports.deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure that item does not have any pending orders
        const pendingOrders = await db.query('SELECT * FROM orders WHERE inventory_id = ? AND status = "Pending"', [id]);
        
        if (pendingOrders.length > 0) {
            return res.status(400).json({ message: 'Cannot delete item with pending orders' });
        }
        
        const deleteQuery = 'DELETE FROM inventory WHERE id = ?';
        await db.query(deleteQuery, [id]);
        res.status(200).json({ message: 'Inventory item deleted successfully!' });
    } catch (err) {
        console.error('Error deleting inventory item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
