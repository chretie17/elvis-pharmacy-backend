const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Route to get unread notifications
router.get('/', notificationController.getNotifications);

// Route to mark a notification as read
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
