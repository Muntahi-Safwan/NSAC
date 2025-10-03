const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// User profile routes
router.get('/profile/:userId', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

// Safety status routes
router.put('/safety-status', userController.updateSafetyStatus);
router.get('/safety-status/:userId', userController.getSafetyStatus);

// Location routes
router.put('/location', userController.updateLocation);

module.exports = router;
