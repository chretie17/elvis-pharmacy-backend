const db = require('../models/db');

// Get all patients
exports.getAllPatients = (req, res) => {
    db.query('SELECT * FROM patients', (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    });
};

// Get a specific patient by ID
exports.getPatientById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM patients WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        res.status(200).json(results[0]);
    });
};

// Add a new patient
exports.addPatient = (req, res) => {
    const { name, prescription, allergies } = req.body;
    if (!name || !prescription || !allergies) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'INSERT INTO patients (name, prescription, allergies) VALUES (?, ?, ?)';
    db.query(query, [name, prescription, allergies], (err, results) => {
        if (err) throw err;
        res.status(201).json({ message: 'Patient added successfully!' });
    });
};

// Update a patient by ID
exports.updatePatient = (req, res) => {
    const { id } = req.params;
    const { name, prescription, allergies } = req.body;
    if (!name || !prescription || !allergies) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'UPDATE patients SET name = ?, prescription = ?, allergies = ? WHERE id = ?';
    db.query(query, [name, prescription, allergies, id], (err, results) => {
        if (err) throw err;
        res.status(200).json({ message: 'Patient updated successfully!' });
    });
};

// Delete a patient by ID
exports.deletePatient = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM patients WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) throw err;
        res.status(200).json({ message: 'Patient deleted successfully!' });
    });
};
