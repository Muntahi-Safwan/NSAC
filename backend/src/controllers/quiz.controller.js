const quizService = require('../services/quiz.service');

/**
 * Generate adaptive quiz
 */
exports.generateQuiz = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId; // Support both authenticated and test users
    const { category = 'air_quality', difficulty = 'beginner' } = req.body;

    const result = await quizService.generateAdaptiveQuiz(userId, category, difficulty);

    res.json({
      success: true,
      data: result.quiz
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quiz',
      details: error.message
    });
  }
};

/**
 * Submit quiz answers
 */
exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { quizId, answers } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Quiz ID and answers array are required'
      });
    }

    const result = await quizService.submitQuiz(userId, quizId, answers);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quiz',
      details: error.message
    });
  }
};

/**
 * Get user's quiz history
 */
exports.getQuizHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    const result = await quizService.getUserQuizHistory(userId);

    res.json({
      success: true,
      data: result.attempts
    });
  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz history',
      details: error.message
    });
  }
};

/**
 * Get personalized recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    const result = await quizService.getPersonalizedRecommendations(userId);

    res.json({
      success: true,
      data: result.recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations',
      details: error.message
    });
  }
};
