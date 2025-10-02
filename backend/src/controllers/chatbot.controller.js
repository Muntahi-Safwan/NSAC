const chatbotService = require('../services/chatbot.service');

/**
 * Send a message to the AI chatbot
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    // Generate AI response
    const response = await chatbotService.generateResponse(message, context);

    res.json({
      success: true,
      data: {
        response: response.message
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
};

/**
 * Get quick health tips based on air quality
 */
exports.getQuickTips = async (req, res) => {
  try {
    const airQualityData = req.body;

    const response = await chatbotService.generateQuickTips(airQualityData);

    res.json({
      success: true,
      data: {
        tips: response.tips
      }
    });
  } catch (error) {
    console.error('Quick tips error:', error);
    res.status(500).json({
      error: 'Failed to generate tips',
      details: error.message
    });
  }
};

/**
 * Analyze air quality trends
 */
exports.analyzeTrends = async (req, res) => {
  try {
    const { historicalData } = req.body;

    if (!historicalData || !Array.isArray(historicalData)) {
      return res.status(400).json({
        error: 'Historical data array is required'
      });
    }

    const response = await chatbotService.analyzeTrends(historicalData);

    res.json({
      success: true,
      data: {
        analysis: response.analysis
      }
    });
  } catch (error) {
    console.error('Trend analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze trends',
      details: error.message
    });
  }
};

/**
 * Get activity-specific recommendations
 */
exports.getActivityRecommendations = async (req, res) => {
  try {
    const { activity, airQuality } = req.body;

    if (!activity || !airQuality) {
      return res.status(400).json({
        error: 'Activity and air quality data are required'
      });
    }

    const response = await chatbotService.getActivityRecommendations(activity, airQuality);

    res.json({
      success: true,
      data: {
        recommendations: response.recommendations
      }
    });
  } catch (error) {
    console.error('Activity recommendations error:', error);
    res.status(500).json({
      error: 'Failed to generate recommendations',
      details: error.message
    });
  }
};

/**
 * Explain an air quality metric
 */
exports.explainMetric = async (req, res) => {
  try {
    const { metric, value } = req.query;

    if (!metric) {
      return res.status(400).json({
        error: 'Metric parameter is required'
      });
    }

    const response = await chatbotService.explainMetric(metric, value);

    res.json({
      success: true,
      data: {
        explanation: response.explanation
      }
    });
  } catch (error) {
    console.error('Metric explanation error:', error);
    res.status(500).json({
      error: 'Failed to explain metric',
      details: error.message
    });
  }
};

/**
 * Get daily AI tip
 */
exports.getDailyTip = async (req, res) => {
  try {
    const response = await chatbotService.generateDailyTip();
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Daily tip error:', error);
    res.status(500).json({
      error: 'Failed to generate daily tip',
      details: error.message
    });
  }
};

/**
 * Get location-based AI insights
 */
exports.getLocationInsights = async (req, res) => {
  try {
    const locationData = req.body;

    if (!locationData.location) {
      return res.status(400).json({
        error: 'Location data is required'
      });
    }

    const response = await chatbotService.generateLocationInsights(locationData);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Location insights error:', error);
    res.status(500).json({
      error: 'Failed to generate location insights',
      details: error.message
    });
  }
};
