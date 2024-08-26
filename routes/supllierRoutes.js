const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supllierController');

router.get('/', SupplierController.getAllSuppliers);
router.post('/', SupplierController.createSupplier);
router.put('/:id', SupplierController.updateSupplier);
router.delete('/:id', SupplierController.deleteSupplier);

module.exports = router;
