const db = require('../models/db');
const nodemailer = require('nodemailer');


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

// Send order to supplier
exports.sendOrderToSupplier = async (req, res) => {
    const { id } = req.params;
    const { supplierId } = req.body;

    try {
        // Update the order with the supplierId
        const updateQuery = 'UPDATE orders SET supplier_id = ? WHERE id = ?';
        const updateResult = await db.query(updateQuery, [supplierId, id]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found or supplier not set' });
        }

        // Fetch the order details including the supplier information
        const query = `
            SELECT 
                orders.id, 
                orders.order_quantity, 
                orders.order_date, 
                orders.status, 
                inventory.name AS inventory_name, 
                suppliers.name AS supplier_name, 
                suppliers.email AS supplier_email 
            FROM 
                orders 
            JOIN 
                inventory 
            ON 
                orders.inventory_id = inventory.id 
            JOIN 
                suppliers 
            ON 
                orders.supplier_id = suppliers.id 
            WHERE 
                orders.id = ?
        `;
        const results = await db.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = results[0];

        // Send email to supplier
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                 user: 'turachretien@gmail.com',
                pass: 'jcmn awwl sxsj egyt'
            }
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: order.supplier_email,
            subject: 'New Order Received',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Order Received</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background-color: #004d40;
                            color: white;
                            text-align: center;
                            padding: 20px;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: #f9f9f9;
                            padding: 20px;
                            border-radius: 0 0 5px 5px;
                        }
                        .order-details {
                            background-color: white;
                            border: 1px solid #004d40;
                            padding: 15px;
                            border-radius: 5px;
                            margin-bottom: 20px;
                        }
                        .btn {
    display: inline-block;
    background-color: #004d40;
    color: white;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
}
.btn:visited {
    color: white;
}
.btn:hover, .btn:active {
    color: white;
    background-color: #00695c; 
}
                        h3 {
                            color: #004d40;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>New Order Received From Pharma Insight</h1>
                    </div>
                    <div class="content">
                        <p>Dear Supplier,</p>
                        <p>We are pleased to inform you that a new order has been placed. Please find the details below:</p>
                        <div class="order-details">
                            <h3>Order Details</h3>
                            <p><strong>Order ID:</strong> ${order.id}</p>
                            <p><strong>Inventory Name:</strong> ${order.inventory_name}</p>
                            <p><strong>Order Quantity:</strong> ${order.order_quantity}</p>
                            <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> ${order.status}</p>
                        </div>
                        <p>Please review the order details and click the button below to accept the order:</p>
                        <p>
                            <a href="http://localhost:5000/api/orders/${order.id}/accept" class="btn">Accept Order</a>
                        </p>
                        <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
                        <p>Thank you for your cooperation.</p>
                        <p>Best regards,<br>Pharma Insight</p>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Order sent to supplier successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send order to supplier' });
    }
};

exports.acceptOrderBySupplier = async (req, res) => {
    const { id } = req.params;

    try {
        const updateQuery = 'UPDATE orders SET status = ? WHERE id = ?';
        const result = await db.query(updateQuery, ['accepted', id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Redirect to a "Thank You" page
        res.redirect('http://localhost:5173/thank-you');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to accept order' });
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
