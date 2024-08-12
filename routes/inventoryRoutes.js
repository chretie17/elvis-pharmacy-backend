const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const verifyToken = require('../middleware/authMiddleware').verifyToken; // Correct import

// Inventory Routes (Inventory Manager or Admin)
router.get('/', verifyToken(['Inventory Manager', 'Admin']), inventoryController.getAllInventory);
router.get('/:id', verifyToken(['Inventory Manager', 'Admin']), inventoryController.getInventoryItemById);
router.post('/', verifyToken(['Inventory Manager', 'Admin']), inventoryController.addInventoryItem);
router.put('/:id', verifyToken(['Inventory Manager', 'Admin']), inventoryController.updateInventoryItem);
router.delete('/:id', verifyToken(['Inventory Manager', 'Admin']), inventoryController.deleteInventoryItem);

module.exports = router;
