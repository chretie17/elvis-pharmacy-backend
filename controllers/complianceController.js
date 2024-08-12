const db = require('../models/db');

// Get all compliance records
exports.getAllComplianceRecords = (req, res) => {
    db.query('SELECT * FROM compliance_records', (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    });
};

// Get a specific compliance record by ID
exports.getComplianceRecordById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM compliance_records WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        res.status(200).json(results[0]);
    });
};

// Add a new compliance record
exports.addComplianceRecord = (req, res) => {
    const { description, compliance_date } = req.body;
    if (!description || !compliance_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'INSERT INTO compliance_records (description, compliance_date) VALUES (?, ?)';
    db.query(query, [description, compliance_date], (err, results) => {
        if (err) throw err;
        res.status(201).json({ message: 'Compliance record added successfully!' });
    });
};

// Update a compliance record by ID
exports.updateComplianceRecord = (req, res) => {
    const { id } = req.params;
    const { description, compliance_date } = req.body;
    if (!description || !compliance_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'UPDATE compliance_records SET description = ?, compliance_date = ? WHERE id = ?';
    db.query(query, [description, compliance_date, id], (err, results) => {
        if (err) throw err;
        res.status(200).json({ message: 'Compliance record updated successfully!' });
    });
};

// Delete a compliance record by ID
exports.deleteComplianceRecord = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM compliance_records WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) throw err;
        res.status(200).json({ message: 'Compliance record deleted successfully!' });
    });
};
