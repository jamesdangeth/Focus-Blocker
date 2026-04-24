import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, HelpCircle, Coffee, Briefcase, ChevronRight, Loader2 } from 'lucide-react';

interface InterceptModalProps {
  url: string;
  onClose: () => void;
}

const InterceptModal: React.FC<InterceptModalProps> = ({ url, onClose }) => {
  const [step, setStep] = useState<'question' | 'delay' | 'result'>('question');
  const [countdown, setCountdown] = useState(10);
  const [action, setAction] = useState<'work' | 'break' | 'unknown' | null>(null);

  useEffect(() => {
    let timer: any;
    if (step === 'delay' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (step === 'delay' && countdown === 0) {
      setStep('result');
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleChoice = (choice: 'work' | 'break' | 'unknown') => {
    setAction(choice);
    if (choice === 'unknown') {
      setStep('delay');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bg-dark/80 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg glass-card border border-white/20 p-12 text-center"
      >
        <div className="mb-8">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-primary" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Focus Shield</h2>
          <p className="text-white/50">
            Evaluating <span className="text-white font-mono font-bold">{url}</span>.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'question' && (
            <motion.div 
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-medium mb-6">Intent?</h3>
              <ActionButton 
                icon={<Briefcase size={20} />} 
                label="Required for work" 
                onClick={() => handleChoice('work')}
              />
              <ActionButton 
                icon={<Coffee size={20} />} 
                label="5-minute break" 
                onClick={() => handleChoice('break')}
              />
              <ActionButton 
                icon={<HelpCircle size={20} />} 
                label="Mindless browsing" 
                onClick={() => handleChoice('unknown')}
              />
            </motion.div>
          )}

          {step === 'delay' && (
            <motion.div 
              key="delay"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-8"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-white/10"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: 251.2 }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-3xl">
                  {countdown}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pause.</h3>
              <p className="text-white/40 max-w-xs mx-auto">
                Mindless browsing breaks your flow. Take 10 seconds to decide.
              </p>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 py-4"
            >
              <p className="text-lg">Still proceed?</p>
              <div className="flex gap-4">
                <button onClick={onClose} className="flex-1 btn-primary">Yes</button>
                <button onClick={onClose} className="flex-1 btn-ghost">Resume Focus</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all group"
  >
    <div className="flex items-center gap-4">
      <div className="text-primary">{icon}</div>
      <span className="font-medium">{label}</span>
    </div>
    <ChevronRight className="text-white/20 group-hover:text-primary transition-colors" size={20} />
  </button>
);

export default InterceptModal;
