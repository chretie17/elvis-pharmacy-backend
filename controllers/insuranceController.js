const db = require('../models/db');

// Get all insurances
exports.getAllInsurances = async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM insurances');
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching insurances:', err);
        res.status(500).json({ message: 'Failed to retrieve insurances' });
    }
};
