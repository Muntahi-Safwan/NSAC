import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestionProps {
  question: string;
  options: string[];
  selectedAnswer: string | null;
  correctAnswer?: string;
  showResult: boolean;
  onSelectAnswer: (answer: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  options,
  selectedAnswer,
  correctAnswer,
  showResult,
  onSelectAnswer
}) => {
  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option
        ? 'border-cyan-400 bg-cyan-500/20'
        : 'border-white/[0.1] bg-white/[0.05] hover:border-cyan-400/50';
    }

    if (option === correctAnswer) {
      return 'border-green-400 bg-green-500/20';
    }

    if (option === selectedAnswer && option !== correctAnswer) {
      return 'border-red-400 bg-red-500/20';
    }

    return 'border-white/[0.1] bg-white/[0.05] opacity-50';
  };

  const getOptionIcon = (option: string) => {
    if (!showResult) return null;

    if (option === correctAnswer) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }

    if (option === selectedAnswer && option !== correctAnswer) {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-6">
        {question}
      </h3>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !showResult && onSelectAnswer(option)}
            disabled={showResult}
            className={`w-full p-4 border-2 rounded-xl transition-all duration-300 text-left flex items-center justify-between ${getOptionStyle(
              option
            )} ${!showResult && 'hover:scale-[1.02]'}`}
          >
            <span className="text-white font-medium">{option}</span>
            {getOptionIcon(option)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizQuestion;
