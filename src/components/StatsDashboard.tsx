import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, AlertTriangle, RotateCcw, BarChart3 } from 'lucide-react';
import { GameState } from '../hooks/useGameState';

interface StatsProps {
  state: GameState;
  onRestart: () => void;
}

export const StatsDashboard: React.FC<StatsProps> = ({ state, onRestart }) => {
  const totalQuestions = state.history.length;
  const correctAnswers = state.history.filter(h => h.correct).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const weakTopics = Object.entries(state.weakTopics)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3);

  const isVictory = state.status === 'completed';

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        {isVictory && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block px-4 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full uppercase tracking-widest border border-green-500/30 mb-4"
          >
            Mission Accomplished! +5 Hearts Bonus
          </motion.div>
        )}
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
          {isVictory ? 'Victory Report' : 'Mission Report'}
        </h1>
        <p className="text-gray-400 font-mono">Class {state.studentClass} • Space Academy Cadet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Trophy className="text-yellow-500" />} 
          label="Final Score" 
          value={state.score.toString()} 
          color="border-yellow-500/20"
        />
        <StatCard 
          icon={<Target className="text-blue-500" />} 
          label="Accuracy" 
          value={`${accuracy}%`} 
          color="border-blue-500/20"
        />
        <StatCard 
          icon={<BarChart3 className="text-purple-500" />} 
          label="Questions" 
          value={totalQuestions.toString()} 
          color="border-purple-500/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} />
            Areas for Improvement
          </h3>
          {weakTopics.length > 0 ? (
            <div className="space-y-4">
              {weakTopics.map(([topic, count]) => (
                <div key={topic} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-gray-300">{topic}</span>
                  <span className="text-orange-400 font-mono text-sm">{count} mistakes</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No weak areas detected yet. Keep flying!</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Cadet Progress</h3>
            <p className="text-gray-400 leading-relaxed">
              {isVictory ? (
                <span className="text-green-400 font-bold block mb-2">🏆 MISSION SUCCESSFUL!</span>
              ) : null}
              You reached Mission Level {state.difficulty}. 
              {accuracy > 80 ? " Your navigation skills are exceptional!" : " Practice makes perfect, Cadet."}
            </p>
          </div>
          
          <button
            onClick={onRestart}
            className="mt-8 w-full py-4 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw size={20} /> New Mission
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className={`bg-white/5 border ${color} rounded-3xl p-6 flex items-center gap-5`}>
    <div className="p-4 bg-white/5 rounded-2xl">
      {icon}
    </div>
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  </div>
);
