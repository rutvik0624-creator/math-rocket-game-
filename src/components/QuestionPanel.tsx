import React from 'react';
import { motion } from 'motion/react';
import { MathQuestion } from '../services/aiService';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface QuestionPanelProps {
  question: MathQuestion;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  lastAnswerCorrect: boolean | null;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({ 
  question, 
  onAnswer, 
  disabled,
  lastAnswerCorrect 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl"
    >
      <div className="mb-2">
        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-bold rounded-full uppercase tracking-wider border border-indigo-500/30">
          {question.topic}
        </span>
      </div>

      <h2 className="text-lg md:text-xl font-medium text-white mb-4 leading-tight">
        {question.question}
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {question.options.map((option, index) => {
          const isCorrect = lastAnswerCorrect === true && option === question.correctAnswer;
          const isWrong = lastAnswerCorrect === false && option !== question.correctAnswer; // Simplified for UI

          return (
            <motion.button
              key={index}
              whileHover={!disabled ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              onClick={() => onAnswer(option)}
              disabled={disabled}
              className={`
                relative p-3 text-left rounded-lg border transition-all duration-200 text-sm
                ${disabled ? 'cursor-default' : 'cursor-pointer'}
                ${isCorrect ? 'bg-green-500/20 border-green-500 text-green-300' : 
                  isWrong ? 'bg-red-500/10 border-white/5 text-white/50' : 
                  'bg-white/5 border-white/10 text-white hover:border-white/30'}
              `}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isCorrect && <CheckCircle2 className="text-green-500" size={20} />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

interface ExplanationPanelProps {
  question: MathQuestion;
  onNext: () => void;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ question, onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl bg-gray-900 border-2 border-red-500/30 rounded-3xl p-6 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-4 text-red-400">
        <XCircle size={24} />
        <h3 className="text-xl font-bold">Not quite right!</h3>
      </div>

      <div className="space-y-4 text-gray-300">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Correct Answer</p>
          <p className="text-xl text-green-400 font-bold">{question.correctAnswer}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Explanation</p>
          <div className="prose prose-invert max-w-none">
            <p className="text-base leading-relaxed italic">
              "{question.explanation}"
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm"
      >
        Continue Mission <ArrowRight size={16} />
      </button>
    </motion.div>
  );
};
