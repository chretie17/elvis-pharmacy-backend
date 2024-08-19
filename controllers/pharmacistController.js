const db = require('../models/db');

// Get all records (pharmacists and their qualifications)
exports.getAllRecords = async (req, res) => {
    try {
        const [records] = await db.query('SELECT * FROM pharmacists');
        res.json(records);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
};

// Add a new pharmacist record
exports.addRecord = async (req, res) => {
    const { name, national_id, license_number, qualification_name, qualification_type, issue_date, expiration_date } = req.body;

    if (!name || !national_id || national_id.length !== 16 || !qualification_name || !qualification_type || !issue_date) {
        return res.status(400).json({ message: 'Name, National ID, qualification name, qualification type, and issue date are required' });
    }

    try {
        const query = `
            INSERT INTO pharmacists (name, national_id, license_number, qualification_name, qualification_type, issue_date, expiration_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(query, [name, national_id, license_number, qualification_name, qualification_type, issue_date, expiration_date]);

        res.status(201).json({ message: 'Record added successfully!' });
    } catch (error) {
        console.error('Error adding record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a pharmacist record
exports.updateRecord = async (req, res) => {
    const { id } = req.params;
    const { name, national_id, license_number, qualification_name, qualification_type, issue_date, expiration_date } = req.body;

    try {
        const query = `
            UPDATE pharmacists
            SET name = ?, national_id = ?, license_number = ?, qualification_name = ?, qualification_type = ?, issue_date = ?, expiration_date = ?
            WHERE id = ?
        `;
        await db.query(query, [name, national_id, license_number, qualification_name, qualification_type, issue_date, expiration_date, id]);

        res.json({ message: 'Record updated successfully!' });
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a pharmacist record
exports.deleteRecord = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM pharmacists WHERE id = ?', [id]);
        res.json({ message: 'Record deleted successfully!' });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
