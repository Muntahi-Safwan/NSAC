const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// NGO notification routes
router.post('/create', notificationController.createNotification);
router.get('/ngo/:ngoId', notificationController.getNGONotifications);
router.delete('/:notificationId', notificationController.deleteNotification);

// User notification routes
router.get('/user/:userId', notificationController.getUserNotifications);

// Alert routes
router.get('/alerts', notificationController.getActiveAlerts);

module.exports = router;
