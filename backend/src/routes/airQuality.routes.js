const express = require('express');
const { query } = require('express-validator');
const airQualityController = require('../controllers/airQuality.controller');

const router = express.Router();

// Validation middleware for coordinates
const coordinateValidation = [
  query('lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lon')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('tolerance')
    .optional()
    .isFloat({ min: 0.01, max: 10 })
    .withMessage('Tolerance must be between 0.01 and 10'),
];

/**
 * @route   GET /api/air-quality/current
 * @desc    Get current air quality for a location
 * @access  Public
 * @params  lat, lon, tolerance (optional)
 */
router.get('/current', coordinateValidation, airQualityController.getCurrentAirQuality);

/**
 * @route   GET /api/air-quality/forecast
 * @desc    Get 24-hour forecast for a location
 * @access  Public
 * @params  lat, lon, tolerance (optional), hours (optional)
 */
router.get(
  '/forecast',
  [
    ...coordinateValidation,
    query('hours').optional().isInt({ min: 1, max: 168 }).withMessage('Hours must be between 1 and 168'),
  ],
  airQualityController.getForecast
);

/**
 * @route   GET /api/air-quality/trends
 * @desc    Get historical trends for a location
 * @access  Public
 * @params  lat, lon, tolerance (optional), hours (optional)
 */
router.get(
  '/trends',
  [
    ...coordinateValidation,
    query('hours').optional().isInt({ min: 1, max: 168 }).withMessage('Hours must be between 1 and 168'),
  ],
  airQualityController.getTrends
);

/**
 * @route   GET /api/air-quality/map-data
 * @desc    Get air quality data for map visualization
 * @access  Public
 * @params  limit (optional), minAQI (optional), maxAQI (optional)
 */
router.get(
  '/map-data',
  [
    query('limit').optional().isInt({ min: 1, max: 5000 }).withMessage('Limit must be between 1 and 5000'),
    query('minAQI').optional().isFloat({ min: 0, max: 500 }).withMessage('minAQI must be between 0 and 500'),
    query('maxAQI').optional().isFloat({ min: 0, max: 500 }).withMessage('maxAQI must be between 0 and 500'),
  ],
  airQualityController.getMapData
);

/**
 * @route   GET /api/air-quality/pollutants
 * @desc    Get detailed pollutant breakdown for a location
 * @access  Public
 * @params  lat, lon, tolerance (optional)
 */
router.get('/pollutants', coordinateValidation, airQualityController.getPollutantDetails);

/**
 * @route   GET /api/air-quality/statistics
 * @desc    Get database statistics
 * @access  Public
 */
router.get('/statistics', airQualityController.getStatistics);

module.exports = router;
