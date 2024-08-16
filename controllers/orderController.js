const db = require('../models/db');

// Get all ordersconst db = require('../models/db');

// Get all orders with inventory names instead of IDs
exports.getAllOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                orders.id, 
                orders.order_quantity, 
                orders.order_date, 
                orders.status, 
                inventory.name AS inventory_name 
            FROM 
                orders 
            JOIN 
                inventory 
            ON 
                orders.inventory_id = inventory.id
        `;
        const results = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve orders' });
    }
};

// Get a specific order by ID with inventory name
exports.getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                orders.id, 
                orders.order_quantity, 
                orders.order_date, 
                orders.status, 
                inventory.name AS inventory_name 
            FROM 
                orders 
            JOIN 
                inventory 
            ON 
                orders.inventory_id = inventory.id
            WHERE 
                orders.id = ?
        `;
        const results = await db.query(query, [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to retrieve order' });
    }
};


// Create a new order
exports.createOrder = async (req, res) => {
    const { inventory_id, order_quantity, order_date, status } = req.body;

    if (!inventory_id || !order_quantity || !order_date || !status) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const query = 'INSERT INTO orders (inventory_id, order_quantity, order_date, status) VALUES (?, ?, ?, ?)';
        await db.query(query, [inventory_id, order_quantity, order_date, status]);
        res.status(201).json({ message: 'Order created successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create order' });
    }
};

// Update an order by ID
exports.updateOrder = async (req, res) => {
    const { id } = req.params;
    const { inventory_id, order_quantity, order_date, status } = req.body;

    if (!inventory_id || !order_quantity || !order_date || !status) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const query = 'UPDATE orders SET inventory_id = ?, order_quantity = ?, order_date = ?, status = ? WHERE id = ?';
        const results = await db.query(query, [inventory_id, order_quantity, order_date, status, id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update order' });
    }
};

// Delete an order by ID
exports.deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const results = await db.query('DELETE FROM orders WHERE id = ?', [id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete order' });
    }
};
