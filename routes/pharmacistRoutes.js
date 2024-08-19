const express = require('express');
const router = express.Router();
const pharmacistsController = require('../controllers/pharmacistController');

router.get('/', pharmacistsController.getAllRecords);
router.post('/', pharmacistsController.addRecord);
router.put('/:id', pharmacistsController.updateRecord);
router.delete('/:id', pharmacistsController.deleteRecord);

module.exports = router;
