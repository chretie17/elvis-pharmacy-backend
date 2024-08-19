const db = require('../models/db');

// Create a notification when inventory is low
exports.createLowInventoryNotification = async (inventoryId) => {
    try {
        const query = `
            INSERT INTO notifications (message)
            SELECT CONCAT('Inventory item ', name, ' is running low (Quantity: ', quantity, ')')
            FROM inventory
            WHERE id = ? AND quantity < 10
        `;
        await db.query(query, [inventoryId]);
    } catch (err) {
        console.error('Error creating low inventory notification:', err);
        throw err;
    }
};

// Create a notification when a new order is placed
exports.createOrderNotification = async (orderId) => {
    try {
        const query = `
            INSERT INTO notifications (message)
            SELECT CONCAT('New order placed for inventory item ', inventory.name, ' (Quantity: ', orders.order_quantity, ')')
            FROM orders
            JOIN inventory ON orders.inventory_id = inventory.id
            WHERE orders.id = ?
        `;
        await db.query(query, [orderId]);
    } catch (err) {
        console.error('Error creating order notification:', err);
        throw err;
    }
};

// Create a notification when a new patient is added
exports.createPatientNotification = async (patientId) => {
    try {
        const query = `
            INSERT INTO notifications (message)
            SELECT CONCAT('New patient added: ', name, ' (National ID: ', national_id, ')')
            FROM patients
            WHERE id = ?
        `;
        await db.query(query, [patientId]);
    } catch (err) {
        console.error('Error creating patient notification:', err);
        throw err;
    }
};

// Fetch unread notifications
exports.getNotifications = async (req, res) => {
    try {
        const query = `
            SELECT id, message, created_at
            FROM notifications
            WHERE is_read = FALSE
            ORDER BY created_at DESC
        `;
        const results = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = ?
        `;
        await db.query(query, [id]);
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};
