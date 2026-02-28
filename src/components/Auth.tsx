import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, User, Lock, ArrowRight, Mail } from 'lucide-react';

interface AuthProps {
  onLogin: (user: { email: string; role: string }) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: fullName }),
      });
      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          onLogin(data.user);
        } else {
          setIsLogin(true);
          setError('Account created! Please login.');
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Rocket className="text-white mx-auto mb-4" size={48} />
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Space <span className="text-indigo-500">Academy</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {isLogin ? 'Welcome back, Cadet.' : 'Join the elite math squadron.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="email" 
              placeholder="Gmail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
              required
            />
          </div>

          {error && (
            <p className={`text-sm text-center ${error.includes('created') ? 'text-green-400' : 'text-red-400'}`}>
              {error}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
