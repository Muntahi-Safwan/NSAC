const { GoogleGenAI } = require('@google/genai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class QuizService {
  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  /**
   * Generate adaptive quiz using AI based on user's skill level
   */
  async generateAdaptiveQuiz(userId, category = 'air_quality', difficulty = 'beginner') {
    try {
      // Get user's past performance (only for authenticated users)
      let adjustedDifficulty = difficulty;

      if (userId && userId !== 'guest') {
        const userAttempts = await prisma.quizAttempt.findMany({
          where: { userId },
          orderBy: { completedAt: 'desc' },
          take: 5
        });

        // Calculate average score to adjust difficulty
        if (userAttempts.length > 0) {
          const avgScore = userAttempts.reduce((sum, attempt) =>
            sum + (attempt.score / attempt.totalQuestions), 0) / userAttempts.length;

          if (avgScore > 0.8) adjustedDifficulty = 'advanced';
          else if (avgScore > 0.6) adjustedDifficulty = 'intermediate';
          else adjustedDifficulty = 'beginner';
        }
      }

      // Generate quiz using AI
      const prompt = `Generate an educational quiz about ${category} for ${adjustedDifficulty} level.

Create exactly 5 multiple-choice questions with the following structure:
- Each question should have 4 options (A, B, C, D)
- Only one correct answer
- Include a detailed explanation for the correct answer
- Questions should be practical and relevant to real-world air quality scenarios

Topics to cover:
- Air Quality Index (AQI) understanding
- Health impacts of pollutants (PM2.5, NO2, O3, etc.)
- Protection measures and safety tips
- NASA satellite data interpretation
- Environmental health science

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": {
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    },
    "correctAnswer": "A",
    "explanation": "Detailed explanation of why this is correct and what users should know."
  }
]

Important: Return ONLY the JSON array, no additional text, no markdown formatting.`;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let questionsData = response.text.trim();

      // Clean up markdown formatting if present
      questionsData = questionsData.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const questions = JSON.parse(questionsData);

      // Create quiz in database
      const quiz = await prisma.quiz.create({
        data: {
          title: `${category.replace('_', ' ')} Quiz - ${adjustedDifficulty}`,
          description: `Adaptive quiz generated based on your skill level`,
          difficulty: adjustedDifficulty,
          category,
          questions: questions
        }
      });

      return {
        success: true,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          difficulty: quiz.difficulty,
          category: quiz.category,
          questions: questions.map(q => ({
            question: q.question,
            options: typeof q.options === 'object' && !Array.isArray(q.options)
              ? Object.values(q.options) // Convert object to array
              : q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }))
        },
        fullQuestions: questions // For server-side validation
      };
    } catch (error) {
      console.error('Error generating adaptive quiz:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  /**
   * Submit quiz and get results
   */
  async submitQuiz(userId, quizId, answers) {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId }
      });

      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const questions = quiz.questions;
      let score = 0;
      const results = [];

      // Grade answers
      questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;

        if (isCorrect) score++;

        results.push({
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation
        });
      });

      // Save attempt only for authenticated users
      let attemptId = null;
      if (userId && userId !== 'guest') {
        // Verify user exists
        const userExists = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (userExists) {
          const attempt = await prisma.quizAttempt.create({
            data: {
              userId,
              quizId,
              score,
              totalQuestions: questions.length,
              answers: results,
              difficulty: quiz.difficulty
            }
          });
          attemptId = attempt.id;
        }
      }

      // Generate personalized feedback using AI
      const feedbackPrompt = `The user scored ${score}/${questions.length} on a ${quiz.difficulty} level ${quiz.category} quiz.

Provide encouraging, personalized feedback in 2-3 sentences that:
1. Acknowledges their performance
2. Highlights what they did well
3. Suggests areas for improvement if score < 80%
4. Encourages continued learning

Keep it positive and motivating.`;

      const feedbackResponse = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: feedbackPrompt
      });

      return {
        success: true,
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        results,
        feedback: feedbackResponse.text,
        attemptId
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw new Error('Failed to submit quiz');
    }
  }

  /**
   * Get user's quiz history
   */
  async getUserQuizHistory(userId) {
    try {
      // Return empty array for guest users
      if (!userId || userId === 'guest') {
        return {
          success: true,
          attempts: []
        };
      }

      const attempts = await prisma.quizAttempt.findMany({
        where: { userId },
        include: { quiz: true },
        orderBy: { completedAt: 'desc' },
        take: 10
      });

      return {
        success: true,
        attempts: attempts.map(attempt => ({
          id: attempt.id,
          quizTitle: attempt.quiz.title,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round((attempt.score / attempt.totalQuestions) * 100),
          difficulty: attempt.difficulty,
          completedAt: attempt.completedAt
        }))
      };
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      throw new Error('Failed to fetch quiz history');
    }
  }

  /**
   * Get personalized learning recommendations
   */
  async getPersonalizedRecommendations(userId) {
    try {
      // Return default recommendations for guest users
      if (!userId || userId === 'guest') {
        return {
          success: true,
          recommendations: [
            'Start with beginner level quizzes to build your foundation',
            'Learn about Air Quality Index (AQI) basics',
            'Understand common pollutants and their health impacts'
          ]
        };
      }

      const attempts = await prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 10
      });

      if (attempts.length === 0) {
        return {
          success: true,
          recommendations: [
            'Start with beginner level quizzes to build your foundation',
            'Learn about Air Quality Index (AQI) basics',
            'Understand common pollutants and their health impacts'
          ]
        };
      }

      // Analyze performance
      const weakAreas = [];
      const strongAreas = [];

      attempts.forEach(attempt => {
        const percentage = (attempt.score / attempt.totalQuestions) * 100;
        if (percentage < 60) {
          weakAreas.push(attempt.quiz.category);
        } else if (percentage > 80) {
          strongAreas.push(attempt.quiz.category);
        }
      });

      const prompt = `Based on quiz performance:
- Weak areas: ${weakAreas.join(', ') || 'None'}
- Strong areas: ${strongAreas.join(', ') || 'Getting started'}

Provide 3-4 specific, actionable learning recommendations to help improve. Each recommendation should be one clear sentence.`;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text;
      const recommendations = text.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*|\*\s*|-\s*/g, '').trim())
        .filter(rec => rec.length > 10);

      return {
        success: true,
        recommendations
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error('Failed to get recommendations');
    }
  }
}

module.exports = new QuizService();
