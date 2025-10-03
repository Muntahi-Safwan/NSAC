const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngo.controller');
const { authenticateNGO } = require('../middleware/auth.middleware');

// Authentication routes (public)
router.post('/register', ngoController.register);
router.post('/login', ngoController.login);

// Profile routes (protected)
router.get('/profile/:ngoId', ngoController.getProfile);
router.put('/profile', authenticateNGO, ngoController.updateProfile);

// Dashboard routes (protected)
router.get('/stats/:ngoId', ngoController.getRegionalStats);
router.get('/users/:ngoId', ngoController.getRegionalUsers);

module.exports = router;
