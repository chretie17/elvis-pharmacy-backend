const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware').verifyToken; // Correct import


// Order Routes (Inventory Manager or Admin)
router.get('/', verifyToken(['Inventory Manager', 'Admin']), orderController.getAllOrders);
router.get('/:id',verifyToken(['Inventory Manager', 'Admin']), orderController.getOrderById);
router.post('/', verifyToken(['Inventory Manager', 'Admin']), orderController.createOrder);
router.put('/:id', verifyToken(['Inventory Manager', 'Admin']), orderController.updateOrder);
router.delete('/:id', verifyToken(['Inventory Manager', 'Admin']), orderController.deleteOrder);
router.post('/:id/send', verifyToken(['Inventory Manager', 'Admin']), orderController.sendOrderToSupplier);
router.get('/:id/accept', orderController.acceptOrderBySupplier);

module.exports = router;
