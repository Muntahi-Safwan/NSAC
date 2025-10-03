const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// User profile routes
router.get('/profile/:userId', userController.getUserProfile);
router.put('/profile', authenticate, userController.updateUserProfile);

// Safety status routes
router.put('/safety-status', authenticate, userController.updateSafetyStatus);
router.get('/safety-status/:userId', userController.getSafetyStatus);

// Location routes
router.put('/location', authenticate, userController.updateLocation);

module.exports = router;
