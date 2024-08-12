const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware').verifyToken; 


// Financial Routes (Admin only)
router.get('/', verifyToken('Admin'), financialController.getAllFinancialRecords);
router.get('/:id', verifyToken('Admin'), financialController.getFinancialRecordById);
router.post('/', verifyToken('Admin'), financialController.addFinancialRecord);
router.put('/:id', verifyToken('Admin'), financialController.updateFinancialRecord);
router.delete('/:id', verifyToken('Admin'), financialController.deleteFinancialRecord);

module.exports = router;
