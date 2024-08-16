const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');

// Route to get all insurances
router.get('/', insuranceController.getAllInsurances);

module.exports = router;
