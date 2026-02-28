import { motion, AnimatePresence } from 'motion/react';
import { useGameState } from './hooks/useGameState';
import { RocketShip, SpaceBackground } from './components/GameCanvas';
import { QuestionPanel, ExplanationPanel } from './components/QuestionPanel';
import { StatsDashboard } from './components/StatsDashboard';
import { Auth } from './components/Auth';
import { AdminPanel } from './components/AdminPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { Heart, Coins, Loader2, Rocket as RocketIcon, ChevronRight, ArrowLeft, ShieldCheck, LogOut, BarChart2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';

export default function App() {
  const { state, setClass, setUser, setDifficulty, submitAnswer, nextAfterExplanation, restart } = useGameState();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (state.lastAnswerCorrect === true) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4ade80', '#60a5fa', '#f472b6']
      });
    }
  }, [state.lastAnswerCorrect]);

  const renderHeader = () => (
    <div className="fixed top-0 left-0 right-0 p-3 flex items-center justify-between z-50">
      <div className="flex items-center gap-3">
        <button 
          onClick={restart}
          className="p-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors"
          title="Back to Menu"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <Heart className="text-red-500 fill-red-500" size={16} />
          <span className="text-white font-black text-lg">{state.lives}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <Coins className="text-yellow-500" size={16} />
          <span className="text-white font-black text-lg">{state.coins}</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-white/50 text-[9px] uppercase tracking-widest font-bold mb-0.5">Progress</div>
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${(state.questionCount / 20) * 100}%` }}
              className="h-full bg-indigo-500"
            />
          </div>
          <span className="text-white font-mono text-xs">{state.questionCount}/20</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <div className="text-white/50 text-[10px] uppercase tracking-widest font-bold mb-1">Score</div>
          <div className="text-white font-black text-3xl tracking-tighter italic">{state.score}</div>
        </div>
        <button 
          onClick={() => setUser(null)}
          className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-xl border border-red-500/30 text-red-400 transition-all"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );

  if (!state.user) {
    return (
      <>
        <SpaceBackground />
        <Auth onLogin={setUser} />
      </>
    );
  }

  if (showAdmin && state.user.role === 'admin') {
    return (
      <>
        <SpaceBackground />
        <AdminPanel onBack={() => setShowAdmin(false)} />
      </>
    );
  }

  if (showAnalytics && (state.user.role === 'analytics' || state.user.role === 'admin')) {
    return (
      <>
        <SpaceBackground />
        <AnalyticsPanel onBack={() => setShowAnalytics(false)} />
      </>
    );
  }

  if (state.status === 'idle') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <SpaceBackground />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-12 max-w-2xl"
        >
          <div className="space-y-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="inline-block"
            >
              <RocketIcon size={120} className="text-white mx-auto" />
            </motion.div>
            <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
              Math <span className="text-indigo-500">Rocket</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium">
              The universe's most advanced AI math training simulator.
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">Select Your Class</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setClass(cls)}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold text-xl transition-all hover:scale-105 active:scale-95"
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {state.user.role === 'admin' && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button 
                onClick={() => setShowAdmin(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 rounded-2xl font-bold transition-all"
              >
                <ShieldCheck size={20} /> Command Center
              </button>
              <button 
                onClick={() => setShowAnalytics(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-2xl font-bold transition-all"
              >
                <BarChart2 size={20} /> Analytics
              </button>
            </div>
          )}

          {state.user.role === 'analytics' && (
            <button 
              onClick={() => setShowAnalytics(true)}
              className="mt-8 flex items-center gap-2 px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-2xl font-bold transition-all mx-auto"
            >
              <BarChart2 size={20} /> View Analytics
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  if (state.status === 'gameover' || state.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <SpaceBackground />
        <StatsDashboard state={state} onRestart={restart} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SpaceBackground />
      {renderHeader()}

      <div className="w-full max-w-4xl flex flex-col items-center gap-4">
        <RocketShip 
          status={
            state.status === 'explanation' ? 'shaking' : 
            state.lastAnswerCorrect === true ? 'success' : 
            'flying'
          } 
          fuel={state.fuel} 
        />

        <AnimatePresence mode="wait">
          {state.status === 'loading' ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-20"
            >
              <Loader2 className="text-indigo-500 animate-spin" size={48} />
              <p className="text-indigo-300 font-mono animate-pulse uppercase tracking-widest text-sm">
                Scanning Sector {state.difficulty}...
              </p>
            </motion.div>
          ) : state.status === 'explanation' ? (
            <ExplanationPanel 
              key="explanation"
              question={state.currentQuestion!} 
              onNext={nextAfterExplanation} 
            />
          ) : (
            <QuestionPanel 
              key="question"
              question={state.currentQuestion!} 
              onAnswer={submitAnswer}
              disabled={state.lastAnswerCorrect !== null}
              lastAnswerCorrect={state.lastAnswerCorrect}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Difficulty Indicator */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Mission Level</span>
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <button 
              key={i} 
              onClick={() => setDifficulty(i + 1)}
              className={`w-2 h-4 rounded-full transition-all duration-300 hover:scale-125 ${i < state.difficulty ? 'bg-indigo-500' : 'bg-white/10'} cursor-pointer`}
              title={`Level ${i + 1}`}
            />
          ))}
        </div>
        <span className="text-white font-mono font-bold text-xs">{state.difficulty}</span>
      </div>
    </div>
  );
}
