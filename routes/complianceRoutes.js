const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect this route with your JWT middleware
router.post('/generate-compliance-report', verifyToken(['Admin']), complianceController.generateComplianceReport);

module.exports = router;
