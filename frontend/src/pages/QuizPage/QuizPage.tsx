import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Brain, ChevronRight, ChevronLeft } from 'lucide-react';
import QuizQuestion from '../../components/Quiz/QuizQuestion';
import QuizResults from '../../components/Quiz/QuizResults';

interface Question {
  question: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

const QuizPage: React.FC = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category] = useState('air_quality');
  const [difficulty] = useState('beginner');
  const navigate = useNavigate();

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : 'guest';

      const response = await axios.post('http://localhost:3000/api/quiz/generate', {
        userId,
        category,
        difficulty
      });

      if (response.data.success) {
        setQuiz(response.data.data);
        setSelectedAnswers(new Array(response.data.data.questions.length).fill(''));
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowResult(false);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowResult(false);
    }
  };

  const handleCheckAnswer = () => {
    setShowResult(true);
  };

  const submitQuiz = async () => {
    if (!quiz) return;

    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : 'guest';

      const answers = selectedAnswers.map((answer, index) => ({
        question: quiz.questions[index].question,
        selectedAnswer: answer,
        correctAnswer: quiz.questions[index].correctAnswer,
        isCorrect: answer === quiz.questions[index].correctAnswer
      }));

      const response = await axios.post('http://localhost:3000/api/quiz/submit', {
        userId,
        quizId: quiz.id,
        answers
      });

      if (response.data.success) {
        setScore(response.data.data.score);
        setQuizCompleted(true);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResult(false);
    setQuizCompleted(false);
    setScore(0);
    generateQuiz();
  };

  const handleGoHome = () => {
    navigate('/learning');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-cyan-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-xl">Generating your adaptive quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Failed to load quiz</p>
          <button
            onClick={generateQuiz}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <QuizResults
            score={score}
            totalQuestions={quiz.questions.length}
            difficulty={difficulty}
            onRetry={handleRetry}
            onGoHome={handleGoHome}
          />
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mb-4 shadow-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            {quiz.title}
          </h1>
          <p className="text-blue-200">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-white/[0.1] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6 md:p-8 mb-6">
          <QuizQuestion
            question={currentQuestion.question}
            options={currentQuestion.options}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            correctAnswer={showResult ? currentQuestion.correctAnswer : undefined}
            showResult={showResult}
            onSelectAnswer={handleSelectAnswer}
          />

          {/* Explanation */}
          {showResult && currentQuestion.explanation && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
              <p className="text-blue-200 text-sm">
                <strong className="text-blue-300">Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="flex gap-3">
            {!showResult && selectedAnswers[currentQuestionIndex] && (
              <button
                onClick={handleCheckAnswer}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl transition-all"
              >
                Check Answer
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestionIndex]}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLastQuestion ? 'Submit Quiz' : 'Next'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
