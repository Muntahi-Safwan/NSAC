const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngo.controller');

// Authentication routes
router.post('/register', ngoController.register);
router.post('/login', ngoController.login);

// Profile routes
router.get('/profile/:ngoId', ngoController.getProfile);
router.put('/profile', ngoController.updateProfile);

// Dashboard routes
router.get('/stats/:ngoId', ngoController.getRegionalStats);
router.get('/users/:ngoId', ngoController.getRegionalUsers);

module.exports = router;
