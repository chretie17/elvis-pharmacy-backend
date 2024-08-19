const express = require('express');
const router = express.Router();
const financialReportController = require('../controllers/reportController');

// Route to get the financial summary
router.get('/summary', financialReportController.getFinancialSummary);

// Route to get the insurance breakdown
router.get('/insurance-breakdown', financialReportController.getInsuranceBreakdown);
router.get('/daily/:date', financialReportController.getDailyReport);


module.exports = router;
