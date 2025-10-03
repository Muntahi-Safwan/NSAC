const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// Search users by phone, name, or social profiles
router.get('/users', searchController.searchUsers);

// Get specific user safety status
router.get('/user/:userId', searchController.getUserSafetyStatus);

module.exports = router;
