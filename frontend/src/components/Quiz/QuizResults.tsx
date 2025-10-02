import React from 'react';
import { Trophy, Star, TrendingUp, RotateCcw, Home } from 'lucide-react';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  difficulty: string;
  onRetry: () => void;
  onGoHome: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  difficulty,
  onRetry,
  onGoHome
}) => {
  const percentage = (score / totalQuestions) * 100;

  const getPerformanceMessage = () => {
    if (percentage >= 80) return { message: 'Excellent!', color: 'from-green-500 to-emerald-600', icon: Trophy };
    if (percentage >= 60) return { message: 'Good Job!', color: 'from-blue-500 to-cyan-600', icon: Star };
    return { message: 'Keep Learning!', color: 'from-orange-500 to-red-500', icon: TrendingUp };
  };

  const performance = getPerformanceMessage();
  const PerformanceIcon = performance.icon;

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${performance.color} rounded-full mb-6 mx-auto`}>
        <PerformanceIcon className="w-12 h-12 text-white" />
      </div>

      <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4">
        {performance.message}
      </h2>

      <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-8 mb-6">
        <div className="text-center mb-6">
          <div className="text-6xl font-display font-black text-white mb-2">
            {score}/{totalQuestions}
          </div>
          <div className="text-xl text-blue-200">
            {percentage}% Correct
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-white/[0.03] rounded-xl">
            <div className="text-2xl font-bold text-cyan-400">{score}</div>
            <div className="text-sm text-blue-200">Correct</div>
          </div>
          <div className="p-4 bg-white/[0.03] rounded-xl">
            <div className="text-2xl font-bold text-orange-400">{totalQuestions - score}</div>
            <div className="text-sm text-blue-200">Incorrect</div>
          </div>
        </div>

        <div className="mt-4 px-4 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-lg">
          <span className="text-indigo-300 text-sm font-medium">Difficulty: {difficulty}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRetry}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
        <button
          onClick={onGoHome}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white rounded-xl transition-all"
        >
          <Home className="w-5 h-5" />
          <span>Back to Learning</span>
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
