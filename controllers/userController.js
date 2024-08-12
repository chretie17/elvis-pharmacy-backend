const db = require('../models/db');
const bcrypt = require('bcrypt');

// Register a new user (Admin only)
exports.registerUser = (req, res) => {
    const { username, email, password, role } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        db.query(query, [username, email, hash, role], (err, results) => {
            if (err) {
                console.error('Error inserting user into database:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
    });
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
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    const updateUserQuery = `UPDATE users SET username = ?, email = ?, role = ?${password ? ', password = ?' : ''} WHERE id = ?`;

    const values = [username, email, role];
    if (password) {
        // Hash the new password if it's provided
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            values.push(hash, id);
            executeUpdateUserQuery(updateUserQuery, values, res);
        });
    } else {
        values.push(id);
        executeUpdateUserQuery(updateUserQuery, values, res);
    }
};

const executeUpdateUserQuery = (query, values, res) => {
    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating user in database:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json({ message: 'User updated successfully!' });
    });
};

// Delete a user by ID (Admin only)
exports.deleteUser = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting user from database:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json({ message: 'User deleted successfully!' });
    });
};
