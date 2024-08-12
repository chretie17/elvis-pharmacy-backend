const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware').verifyToken; 


// Compliance Routes (Admin only)
router.get('/', verifyToken('Admin'), complianceController.getAllComplianceRecords);
router.get('/:id', verifyToken('Admin'), complianceController.getComplianceRecordById);
router.post('/', verifyToken('Admin'), complianceController.addComplianceRecord);
router.put('/:id', verifyToken('Admin'), complianceController.updateComplianceRecord);
router.delete('/:id', verifyToken('Admin'), complianceController.deleteComplianceRecord);

module.exports = router;
