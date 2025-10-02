const express = require('express');
const router = express.Router();
const wildfireController = require('../controllers/wildfire.controller');

// Get active fires from NASA FIRMS
router.get('/active', wildfireController.getActiveFires);

// Get fires by region
router.get('/region/:region', wildfireController.getFiresByRegion);

// Get fire statistics
router.get('/statistics', wildfireController.getFireStatistics);

module.exports = router;
