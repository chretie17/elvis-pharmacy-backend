const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware').verifyToken; // Correct import


// Patient Routes (Pharmacist or Admin)
router.get('/', verifyToken(['Pharmacist', 'Admin']), patientController.getAllPatients);
router.get('/:id', verifyToken(['Pharmacist', 'Admin']), patientController.getPatientById);
router.post('/', verifyToken(['Pharmacist', 'Admin']), patientController.addPatient);
router.put('/:id', verifyToken(['Pharmacist', 'Admin']), patientController.updatePatient);
router.delete('/:id', verifyToken(['Pharmacist', 'Admin']), patientController.deletePatient);
router.get('/in',verifyToken(['Pharmacist', 'Admin']), patientController.getAllInsurances);


module.exports = router;
