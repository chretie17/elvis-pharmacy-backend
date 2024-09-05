const db = require('../models/db');
const nodemailer = require('nodemailer');
require('dotenv').config(); 
const { format } = require('date-fns'); // Import date-fns for date formatting


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
// Add a new inventory item with validation checks
exports.addInventoryItem = async (req, res) => {
    try {
        const { name, manufacturer, type, quantity, expiration_date, price, age_allowed_min, age_allowed_max, usage_instructions, side_effects, contraindications } = req.body;
        
        if (!name || !manufacturer || !type || !quantity || !expiration_date || !price) {
            return res.status(400).json({ message: 'Name, manufacturer, type, quantity, expiration date, and price are required' });
        }
        
        const query = `INSERT INTO inventory 
                      (name, manufacturer, type, quantity, expiration_date, price, age_allowed_min, age_allowed_max, usage_instructions, side_effects, contraindications) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.query(query, [name, manufacturer, type, quantity, expiration_date, price, age_allowed_min, age_allowed_max, usage_instructions, side_effects, contraindications]);
        res.status(201).json({ message: 'Inventory item added successfully!' });
    } catch (err) {
        console.error('Error adding inventory item:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// Check inventory for items near expiration and create notifications
// Check inventory for items near expiration and create notifications

// Check inventory for items near expiration and create notifications
const sendEmailAlert = async (itemName, expirationDate) => {
    try {
        // Format the expiration date to a readable format
        const formattedDate = format(new Date(expirationDate), 'EEE, MMM dd yyyy');

        // Configure the email transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // or your email service provider
            auth: {
                user: process.env.EMAIL_USER, // Email from environment variables
                pass: process.env.EMAIL_PASS  // Password or app-specific password from environment variables
            }
        });

        // Set up the email options
        const mailOptions = {
            from: process.env.EMAIL_USER, // sender address
            to: 'cyusaelvis4@gmail.com', // list of receivers
            subject: 'Urgent: Medicine Expiry Alert', // Subject line
            text: `The inventory item ${itemName} is about to expire on ${formattedDate}. Please take necessary action.`
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Email alert sent successfully!');
    } catch (err) {
        console.error('Error sending email:', err.message); // Improved error logging
    }
};

// Function to check inventory for items near expiration and create notifications
exports.checkForExpiringItems = async () => {
    try {
        console.log('Running check for expiring items...');
        // Query to find items near expiration
        const query = `
            SELECT id, name, expiration_date
            FROM inventory
            WHERE DATEDIFF(expiration_date, CURDATE()) <= 7 AND DATEDIFF(expiration_date, CURDATE()) > 0
        `;
        const results = await db.query(query);
        
        console.log(`Found ${results.length} item(s) near expiration.`);

        if (results.length > 0) {
            for (const item of results) {
                const notificationQuery = `
                    INSERT INTO notifications (message)
                    VALUES (?)
                `;
                // Format the expiration date to a more readable format
                const formattedDate = format(new Date(item.expiration_date), 'EEE, MMM dd yyyy');
                const message = `Inventory item ${item.name} is about to expire on ${formattedDate}`;
                
                try {
                    // Attempt to insert notification
                    await db.query(notificationQuery, [message]);
                    console.log(`Notification created for item ${item.name}.`);

                    // Call sendEmailAlert to send the email
                    await sendEmailAlert(item.name, item.expiration_date);
                } catch (insertErr) {
                    console.error(`Error inserting notification for item ${item.name}:`, insertErr.message);
                }
            }
        } else {
            console.log('No items found that are near expiration.');
        }
    } catch (err) {
        console.error('Error checking for expiring items:', err.message);
    }
};

exports.updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, manufacturer, type, quantity, expiration_date, price, age_allowed_min, age_allowed_max, usage_instructions, side_effects, contraindications } = req.body;

        if (!name || !manufacturer || !type || !quantity || !expiration_date || !price) {
            return res.status(400).json({ message: 'Name, manufacturer, type, quantity, expiration date, and price are required' });
        }

        const updateQuery = `UPDATE inventory SET 
                             name = ?, manufacturer = ?, type = ?, quantity = ?, expiration_date = ?, price = ?, 
                             age_allowed_min = ?, age_allowed_max = ?, usage_instructions = ?, side_effects = ?, contraindications = ? 
                             WHERE id = ?`;
        const results = await db.query(updateQuery, [name, manufacturer, type, quantity, expiration_date, price, age_allowed_min, age_allowed_max, usage_instructions, side_effects, contraindications, id]);

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
