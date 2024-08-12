const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware').verifyToken; 

// User Routes (Admin only)
router.post('/', verifyToken('Admin'), userController.registerUser);
router.get('/', verifyToken('Admin'), userController.getAllUsers);
router.delete('/:id', verifyToken('Admin'), userController.deleteUser);
router.put('/:id', verifyToken('Admin'), userController.updateUser); // Update user


module.exports = router;
