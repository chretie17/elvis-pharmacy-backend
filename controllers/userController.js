const db = require('../models/db');
const bcrypt = require('bcrypt');

// Register a new user (Admin only)
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Hash the password
        const hash = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        await db.query(query, [username, email, hash, role]);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all users (Admin only)
exports.getAllUsers = (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error fetching users from database:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json(results);
    });
};

// Update a user by ID (Admin only)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;

        const updateUserQuery = `UPDATE users SET username = ?, email = ?, role = ?${password ? ', password = ?' : ''} WHERE id = ?`;

        const values = [username, email, role];
        if (password) {
            // Hash the new password if it's provided
            const hash = await bcrypt.hash(password, 10);
            values.push(hash, id);
        } else {
            values.push(id);
        }

        await db.query(updateUserQuery, values);
        res.status(200).json({ message: 'User updated successfully!' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// Delete a user by ID (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM users WHERE id = ?';
        await db.query(query, [id]);
        res.status(200).json({ message: 'User deleted successfully!' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};