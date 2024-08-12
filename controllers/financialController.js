const db = require('../models/db');

// Get all financial records
exports.getAllFinancialRecords = (req, res) => {
    db.query('SELECT * FROM financial_records', (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    });
};

// Get a specific financial record by ID
exports.getFinancialRecordById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM financial_records WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        res.status(200).json(results[0]);
    });
};

// Add a new financial record
exports.addFinancialRecord = (req, res) => {
    const { record_type, amount, date } = req.body;
    if (!record_type || !amount || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'INSERT INTO financial_records (record_type, amount, date) VALUES (?, ?, ?)';
    db.query(query, [record_type, amount, date], (err, results) => {
        if (err) throw err;
        res.status(201).json({ message: 'Financial record added successfully!' });
    });
};

// Update a financial record by ID
exports.updateFinancialRecord = (req, res) => {
    const { id } = req.params;
    const { record_type, amount, date } = req.body;
    if (!record_type || !amount || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'UPDATE financial_records SET record_type = ?, amount = ?, date = ? WHERE id = ?';
    db.query(query, [record_type, amount, date, id], (err, results) => {
        if (err) throw err;
        res.status(200).json({ message: 'Financial record updated successfully!' });
    });
};

// Delete a financial record by ID
exports.deleteFinancialRecord = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM financial_records WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) throw err;
        res.status(200).json({ message: 'Financial record deleted successfully!' });
    });
};
