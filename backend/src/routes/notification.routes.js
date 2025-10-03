const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate, authenticateNGO } = require('../middleware/auth.middleware');

// NGO notification routes (protected - NGO only)
router.post('/create', authenticateNGO, notificationController.createNotification);
router.get('/ngo/:ngoId', notificationController.getNGONotifications);
router.delete('/:notificationId', authenticateNGO, notificationController.deleteNotification);

// User notification routes (protected - User only)
router.get('/user/:userId', notificationController.getUserNotifications);

// Alert routes (public - no auth required)
router.get('/alerts', notificationController.getActiveAlerts);

module.exports = router;
