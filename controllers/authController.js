const jwt = require('jsonwebtoken');
const db = require('../models/db');
const bcrypt = require('bcrypt');

exports.login = (req, res) => {
    const { email, password } = req.body;
    console.log("Received login request with email:", email);

    db.query('SELECT * FROM users WHERE email = ?', [email])
        .then(results => {
            console.log("SQL query executed successfully, results:", results);

            if (results.length === 0) {
                console.log("No user found with this email");
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = results[0];
            console.log("User found:", user);

            bcrypt.compare(password, user.password, (err, match) => {
                console.log("Inside bcrypt.compare callback");
                if (err) {
                    console.error("Error during password comparison:", err);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (!match) {
                    console.log("Password mismatch");
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                console.log("Password matched, generating token...");

                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    process.env.JWT_SECRET, 
                    { expiresIn: '24h' }
                );

                console.log("Token generated:", token);
                return res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
            });
        })
        .catch(err => {
            console.error("Database query error:", err);
            res.status(500).json({ message: 'Internal server error' });
        });
};
