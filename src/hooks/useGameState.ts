import { useState, useEffect, useCallback } from 'react';
import { generateQuestion, MathQuestion } from '../services/aiService';

export interface GameState {
  user: { email: string; role: string } | null;
  studentClass: number | null;
  score: number;
  coins: number;
  lives: number;
  fuel: number;
  difficulty: number;
  currentQuestion: MathQuestion | null;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  weakTopics: Record<string, number>;
  history: { topic: string; correct: boolean }[];
  questionCount: number;
  status: 'idle' | 'loading' | 'playing' | 'explanation' | 'gameover' | 'completed';
  lastAnswerCorrect: boolean | null;
}

export const useGameState = () => {
  const [state, setState] = useState<GameState>({
    user: null,
    studentClass: null,
    score: 0,
    coins: 0,
    lives: 7,
    fuel: 50,
    difficulty: 1,
    currentQuestion: null,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    weakTopics: {},
    history: [],
    questionCount: 0,
    status: 'idle',
    lastAnswerCorrect: null,
  });

  const setClass = (cls: number) => {
    setState(prev => ({ ...prev, studentClass: cls, status: 'loading' }));
  };

  const setUser = (user: { email: string; role: string } | null) => {
    setState(prev => ({ ...prev, user }));
  };

  const saveResults = async () => {
    if (!state.user || !state.studentClass) return;
    
    const correctAnswers = state.history.filter(h => h.correct).length;
    const accuracy = state.history.length > 0 ? Math.round((correctAnswers / state.history.length) * 100) : 0;

    try {
      await fetch('/api/game/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.user.email,
          score: state.score,
          accuracy,
          studentClass: state.studentClass,
          difficulty: state.difficulty
        }),
      });
    } catch (e) {
      console.error("Failed to save mission data");
    }
  };

  const fetchNextQuestion = useCallback(async () => {
    if (!state.studentClass) return;
    
    setState(prev => ({ ...prev, status: 'loading' }));
    
    const weakTopicsList = Object.entries(state.weakTopics)
      .filter(([_, count]) => (count as number) > 1)
      .map(([topic]) => topic);

    const question = await generateQuestion(state.studentClass, state.difficulty, weakTopicsList);
    
    setState(prev => ({ 
      ...prev, 
      currentQuestion: question, 
      questionCount: prev.questionCount + 1,
      status: 'playing',
      lastAnswerCorrect: null 
    }));
  }, [state.studentClass, state.difficulty, state.weakTopics]);

  useEffect(() => {
    if (state.status === 'loading' && state.studentClass && !state.currentQuestion) {
      fetchNextQuestion();
    }
  }, [state.status, state.studentClass, state.currentQuestion, fetchNextQuestion]);

  const submitAnswer = (answer: string) => {
    if (!state.currentQuestion) return;

    const isCorrect = answer === state.currentQuestion.correctAnswer;
    const topic = state.currentQuestion.topic;

    setState(prev => {
      const newConsecutiveCorrect = isCorrect ? prev.consecutiveCorrect + 1 : 0;
      const newConsecutiveWrong = !isCorrect ? prev.consecutiveWrong + 1 : 0;
      
      let newDifficulty = prev.difficulty;
      if (newConsecutiveCorrect >= 2) {
        newDifficulty = Math.min(10, prev.difficulty + 1);
      } else if (newConsecutiveWrong >= 2) {
        newDifficulty = Math.max(1, prev.difficulty - 1);
      }

      const newWeakTopics = { ...prev.weakTopics };
      if (!isCorrect) {
        newWeakTopics[topic] = (newWeakTopics[topic] || 0) + 1;
      }

      const newLives = isCorrect ? prev.lives : prev.lives - 1;
      const newFuel = isCorrect ? Math.min(100, prev.fuel + 15) : Math.max(0, prev.fuel - 20);

      return {
        ...prev,
        score: isCorrect ? prev.score + (prev.difficulty * 10) : prev.score,
        coins: isCorrect ? prev.coins + 5 : prev.coins,
        lives: newLives,
        fuel: newFuel,
        difficulty: newDifficulty,
        consecutiveCorrect: newConsecutiveCorrect >= 2 ? 0 : newConsecutiveCorrect,
        consecutiveWrong: newConsecutiveWrong >= 2 ? 0 : newConsecutiveWrong,
        weakTopics: newWeakTopics,
        history: [...prev.history, { topic, correct: isCorrect }],
        lastAnswerCorrect: isCorrect,
        status: isCorrect ? 'playing' : 'explanation'
      };
    });

    if (isCorrect) {
      setTimeout(() => {
        if (state.questionCount >= 20) {
          setState(prev => ({ ...prev, lives: prev.lives + 5, status: 'completed' }));
          saveResults();
        } else {
          fetchNextQuestion();
        }
      }, 1500);
    }
  };

  const nextAfterExplanation = () => {
    if (state.lives <= 0) {
      setState(prev => ({ ...prev, status: 'gameover' }));
    } else if (state.questionCount >= 20) {
      setState(prev => ({ ...prev, lives: prev.lives + 5, status: 'completed' }));
      saveResults();
    } else {
      fetchNextQuestion();
    }
  };

  const setDifficulty = (level: number) => {
    setState(prev => ({ 
      ...prev, 
      difficulty: level, 
      consecutiveCorrect: 0, 
      consecutiveWrong: 0,
      status: 'loading' 
    }));
  };

  const restart = () => {
    setState({
      studentClass: null,
      score: 0,
      coins: 0,
      lives: 7,
      fuel: 50,
      difficulty: 1,
      currentQuestion: null,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      weakTopics: {},
      history: [],
      questionCount: 0,
      status: 'idle',
      lastAnswerCorrect: null,
    });
  };

  return {
    state,
    setClass,
    setUser,
    setDifficulty,
    submitAnswer,
    nextAfterExplanation,
    restart
  };
};
