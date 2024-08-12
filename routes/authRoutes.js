const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication Route
router.post('/login', authController.login);

module.exports = router;
