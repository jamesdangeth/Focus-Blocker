import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Coffee, Zap, Users, CheckCircle, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';

const FocusTimer: React.FC = () => {
  const isActive = useStore(state => state.isActive);
  const sessionEndTime = useStore(state => state.sessionEndTime);
  const initialTime = useStore(state => state.initialTime);
  const startSession = useStore(state => state.startSession);
  const stopSession = useStore(state => state.stopSession);

  const [timer, setTimer] = useState(0);
  const [uiState, setUiState] = useState<'idle' | 'countdown' | 'focus' | 'completed'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [pendingConfig, setPendingConfig] = useState<{mode: string, mins: number} | null>(null);

  useEffect(() => {
    if (isActive) {
      setUiState('focus');
    } else if (uiState === 'focus' && timer === 0 && initialTime > 0) {
      setUiState('completed');
    } else if (uiState === 'focus' && timer > 0) {
      setUiState('idle');
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !sessionEndTime) {
      setTimer(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((sessionEndTime - Date.now()) / 1000));
      setTimer(remaining);
      if (remaining === 0) {
        stopSession();
        setUiState('completed');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isActive, sessionEndTime, stopSession]);

  useEffect(() => {
    if (uiState === 'countdown') {
      if (countdown > 0) {
        const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timerId);
      } else {
        if (pendingConfig) {
          startSession(pendingConfig.mode, pendingConfig.mins);
          setPendingConfig(null);
        }
      }
    }
  }, [uiState, countdown, pendingConfig, startSession]);

  const handleStart = (mode: string, mins: number) => {
    setPendingConfig({ mode, mins });
    setCountdown(3);
    setUiState('countdown');
  };

  const handleEnd = () => {
    stopSession();
    setUiState('idle');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? (timer / initialTime) * 100 : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl glass-card py-16 flex flex-col items-center relative overflow-hidden min-h-[400px] justify-center">
        {/* Animated Background Rings (Focus State) */}
        <AnimatePresence>
          {uiState === 'focus' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 flex items-center justify-center -z-10"
            >
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute w-[500px] h-[500px] border border-accent/40 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity }} className="absolute w-[400px] h-[400px] border border-accent/40 rounded-full" />
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity }} className="absolute w-[300px] h-[300px] border border-accent/60 rounded-full shadow-[0_0_40px_rgba(0,209,178,0.3)]" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {uiState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center w-full"
            >
              <h2 className="text-4xl font-black tracking-tighter mb-8 italic">Start Focus.</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-8">
                <ModeButton icon={<Zap size={20} />} label="Deep Work" minutes={25} description="Full focus" onClick={() => handleStart('deep', 25)} />
                <ModeButton icon={<Coffee size={20} />} label="Flow State" minutes={50} description="Longer rhythm" onClick={() => handleStart('light', 50)} />
                <ModeButton icon={<Users size={20} />} label="Focus Sync" minutes={15} description="Coordinated work" onClick={() => handleStart('meeting', 15)} />
              </div>
            </motion.div>
          )}

          {uiState === 'countdown' && (
            <motion.div 
              key="countdown"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <p className="text-white/50 tracking-[0.3em] uppercase font-black text-[10px] mb-4">Getting Ready</p>
              <motion.div 
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-[120px] font-black text-accent drop-shadow-[0_0_30px_rgba(0,209,178,0.5)]"
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}

          {uiState === 'focus' && (
            <motion.div 
              key="focus"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center z-10 w-full px-12"
            >
              <div className="text-[120px] font-black tracking-tighter leading-none mb-4 tabular-nums drop-shadow-[0_0_40px_rgba(0,209,178,0.3)] text-white">
                {formatTime(timer)}
              </div>
              
              <div className="w-full h-1.5 bg-white/10 rounded-full mb-12 relative overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 1 }}
                  className="absolute left-0 top-0 h-full bg-accent shadow-[0_0_15px_rgba(0,209,178,0.8)]"
                />
              </div>

              <div className="flex justify-center gap-6">
                <button 
                  onClick={handleEnd}
                  className="px-6 py-3 rounded-xl flex items-center gap-2 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all font-semibold text-white/80 hover:text-white"
                >
                  <Square size={18} fill="currentColor" />
                  End Early
                </button>
              </div>
            </motion.div>
          )}

          {uiState === 'completed' && (
            <motion.div 
              key="completed"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center text-center px-8"
            >
              <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(0,209,178,0.4)]">
                <CheckCircle size={48} className="text-accent" />
              </div>
              <h2 className="text-4xl font-black mb-4">Focus done.</h2>
              <p className="text-white/60 text-lg mb-8 max-w-md">
                You're making progress. Take a break, then start again.
              </p>
              <button 
                onClick={() => setUiState('idle')}
                className="btn-primary"
              >
                Start Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {uiState === 'focus' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center max-w-md w-full"
        >
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex gap-4 items-start text-left">
            <div className="bg-primary/20 p-2 rounded-lg mt-1">
              <ShieldAlert className="text-primary" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">Shield active</h4>
              <p className="text-sm text-white/60 leading-relaxed">
                Interruption lock is on.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const ModeButton = ({ icon, label, minutes, description, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group p-5 w-full rounded-2xl relative overflow-hidden"
  >
    <div className="p-2.5 bg-primary/20 text-primary w-fit rounded-xl mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="font-bold text-lg mb-1">{label}</div>
    <div className="text-xs text-white/50 mb-4">{description}</div>
    <div className="text-2xl font-black text-white/90">{minutes} <span className="text-sm font-medium text-white/40">min</span></div>
    
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
      <Play size={20} className="text-accent" fill="currentColor" />
    </div>
  </button>
);

export default FocusTimer;
