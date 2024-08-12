const express = require('express');
const router = express.Router();
const pharmacistController = require('../controllers/pharmacistController');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware').verifyToken; // Correct import


// Pharmacist Routes (Admin only)
router.get('/', verifyToken('Admin'), pharmacistController.getAllPharmacists);
router.get('/:id', verifyToken('Admin'), pharmacistController.getPharmacistById);
router.post('/', verifyToken('Admin'), pharmacistController.addPharmacist);
router.put('/:id', verifyToken('Admin'), pharmacistController.updatePharmacist);
router.delete('/:id', verifyToken('Admin'), pharmacistController.deletePharmacist);

module.exports = router;
