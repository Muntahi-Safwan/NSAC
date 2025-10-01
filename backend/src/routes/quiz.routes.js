const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

// Generate adaptive quiz
router.post('/generate', quizController.generateQuiz);

// Submit quiz answers
router.post('/submit', quizController.submitQuiz);

// Get quiz history
router.get('/history/:userId', quizController.getQuizHistory);

// Get personalized recommendations
router.get('/recommendations/:userId', quizController.getRecommendations);

module.exports = router;
