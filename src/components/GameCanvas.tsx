import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Flame, Star } from 'lucide-react';

interface RocketProps {
  status: 'flying' | 'shaking' | 'success' | 'idle';
  fuel: number;
}

export const RocketShip: React.FC<RocketProps> = ({ status, fuel }) => {
  const isShaking = status === 'shaking';
  const isSuccess = status === 'success';

  return (
    <div className="relative flex flex-col items-center justify-center h-64 w-full overflow-visible">
      <motion.div
        animate={
          isShaking 
            ? { x: [-4, 4, -4, 4, 0], y: [0, 10, 0] } 
            : isSuccess 
            ? { 
                y: [0, 10, -800], 
                scale: [1, 1.1, 0.6],
                rotate: [0, -2, 2, 0]
              }
            : { y: [0, -10, 0] }
        }
        transition={{ 
          duration: isShaking ? 0.1 : isSuccess ? 1.2 : 2.5, 
          times: isSuccess ? [0, 0.1, 1] : undefined,
          repeat: isShaking ? 5 : isSuccess ? 0 : Infinity,
          ease: isSuccess ? "easeIn" : "easeInOut"
        }}
        className="relative z-10"
      >
        <Rocket 
          size={100} 
          className={`${isShaking ? 'text-red-500' : isSuccess ? 'text-green-400' : 'text-white'} transition-colors duration-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]`}
          fill="currentColor"
        />
        
        {/* Engine Flame */}
        <AnimatePresence>
          {(status === 'flying' || isSuccess) && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isSuccess 
                ? { opacity: 1, scale: [1, 2, 1.5], y: [0, 10, 0] }
                : { opacity: 1, scale: [1, 1.2, 1] }
              }
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 0.15 }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-orange-500"
            >
              <Flame size={isSuccess ? 80 : 50} fill="currentColor" />
              {isSuccess && (
                <motion.div 
                  animate={{ opacity: [0, 1, 0], scale: [1, 2.5, 4] }}
                  transition={{ repeat: Infinity, duration: 0.1 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-24 bg-yellow-400/40 blur-2xl rounded-full"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speed Lines during launch */}
        <AnimatePresence>
          {isSuccess && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-60 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -100 }}
                  animate={{ opacity: [0, 1, 0], y: [0, 300] }}
                  transition={{ 
                    duration: 0.2, 
                    repeat: Infinity, 
                    delay: i * 0.05,
                    ease: "linear"
                  }}
                  className="absolute w-0.5 bg-white/40 rounded-full"
                  style={{ 
                    height: Math.random() * 40 + 20,
                    left: `${(i * 20) - 40}%` 
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Smoke for failure */}
        <AnimatePresence>
          {isShaking && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.5, 0], y: [0, 40], x: [-10, 10, -10] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-400 rounded-full blur-xl"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Launch Pad / Platform Effect */}
      <div className="absolute bottom-8 w-32 h-1 bg-white/20 blur-md rounded-full" />

      {/* Fuel Meter */}
      <div className="absolute bottom-0 w-48 h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${fuel}%` }}
          className={`h-full ${fuel < 20 ? 'bg-red-500' : fuel < 50 ? 'bg-yellow-500' : 'bg-green-500'} shadow-[0_0_5px_rgba(255,255,255,0.2)]`}
        />
      </div>
      <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-mono">Fuel Level</span>
    </div>
  );
};

export const SpaceBackground: React.FC = () => {
  const stars = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="fixed inset-0 bg-[#050505] overflow-hidden -z-10">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: star.duration, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bg-white rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-blue-900/20" />
    </div>
  );
};
