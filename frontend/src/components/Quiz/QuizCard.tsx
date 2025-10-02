import React from 'react';
import { Brain, Trophy, Target, TrendingUp } from 'lucide-react';

interface QuizCardProps {
  category: string;
  difficulty: string;
  onStart: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ category, difficulty, onStart }) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'air_quality':
        return Target;
      case 'health':
        return Brain;
      case 'environment':
        return TrendingUp;
      default:
        return Trophy;
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner':
        return 'from-green-500 to-emerald-600';
      case 'intermediate':
        return 'from-yellow-500 to-orange-500';
      case 'advanced':
        return 'from-red-500 to-purple-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  const Icon = getCategoryIcon();

  return (
    <div className="group relative bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] hover:border-cyan-400/30 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]">
      <div className={`w-12 h-12 bg-gradient-to-br ${getDifficultyColor()} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-lg font-display font-bold text-white mb-2">
        {category.replace('_', ' ').toUpperCase()} Quiz
      </h3>

      <p className="text-blue-200 text-sm mb-4">
        Test your knowledge on {category.replace('_', ' ')} topics
      </p>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 bg-gradient-to-r ${getDifficultyColor()} rounded-lg text-white text-xs font-medium`}>
          {difficulty}
        </span>
        <span className="text-blue-300 text-xs">5 questions</span>
      </div>

      <button
        onClick={onStart}
        className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg"
      >
        Start Quiz
      </button>
    </div>
  );
};

export default QuizCard;
