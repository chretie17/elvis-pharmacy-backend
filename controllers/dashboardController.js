const express = require('express');
const router = express.Router();
const db = require('./db'); // Import the configured database connection

// Inventory API
router.get('/inventory', async (req, res) => {
  try {
    const [inventory] = await db.query('SELECT * FROM inventory');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory data' });
  }
});

// Orders API
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE status = "Pending"');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders data' });
  }
});

// Patients API
router.get('/patients', async (req, res) => {
  try {
    const [patients] = await db.query('SELECT * FROM patients');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients data' });
  }
});

// Total Cost API
router.get('/total-cost', async (req, res) => {
  try {
    const [result] = await db.query('SELECT SUM(total_cost) AS totalCost FROM patients');
    res.json({ totalCost: result[0].totalCost });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch total cost' });
  }
});

// Final Cost API
router.get('/final-cost', async (req, res) => {
  try {
    const [result] = await db.query('SELECT SUM(final_cost) AS finalCost FROM patients');
    res.json({ finalCost: result[0].finalCost });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch final cost' });
  }
});

module.exports = router;
