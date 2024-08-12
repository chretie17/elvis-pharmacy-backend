const db = require('../models/db');

// Get all pharmacists
exports.getAllPharmacists = (req, res) => {
    db.query('SELECT * FROM pharmacists', (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    });
};

// Get a specific pharmacist by ID
exports.getPharmacistById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM pharmacists WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        res.status(200).json(results[0]);
    });
};

// Add a new pharmacist
exports.addPharmacist = (req, res) => {
    const { name, license_number, qualifications } = req.body;
    if (!name || !license_number || !qualifications) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'INSERT INTO pharmacists (name, license_number, qualifications) VALUES (?, ?, ?)';
    db.query(query, [name, license_number, qualifications], (err, results) => {
        if (err) throw err;
        res.status(201).json({ message: 'Pharmacist added successfully!' });
    });
};

// Update a pharmacist by ID
exports.updatePharmacist = (req, res) => {
    const { id } = req.params;
    const { name, license_number, qualifications } = req.body;
    if (!name || !license_number || !qualifications) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'UPDATE pharmacists SET name = ?, license_number = ?, qualifications = ? WHERE id = ?';
    db.query(query, [name, license_number, qualifications, id], (err, results) => {
        if (err) throw err;
        res.status(200).json({ message: 'Pharmacist updated successfully!' });
    });
};

// Delete a pharmacist by ID
exports.deletePharmacist = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM pharmacists WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) throw err;
        res.status(200).json({ message: 'Pharmacist deleted successfully!' });
    });
};
