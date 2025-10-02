const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');

// Main chat endpoint
router.post('/message', chatbotController.sendMessage);

// Quick tips endpoint
router.post('/tips', chatbotController.getQuickTips);

// Trend analysis endpoint
router.post('/analyze-trends', chatbotController.analyzeTrends);

// Activity recommendations endpoint
router.post('/activity-recommendations', chatbotController.getActivityRecommendations);

// Metric explanation endpoint
router.get('/explain-metric', chatbotController.explainMetric);

// Daily tip endpoint
router.get('/daily-tip', chatbotController.getDailyTip);

// Location insights endpoint
router.post('/location-insights', chatbotController.getLocationInsights);

module.exports = router;
