import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Shield, Zap, Check, Coffee } from 'lucide-react';
import { useStore } from '../store/useStore';

const Onboarding: React.FC = () => {
  const setUser = useStore(state => state.setUser);
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);

  const handleComplete = () => {
    setUser({
      id: 'demo-user-123',
      email: 'user@example.com',
      plan: 'free'
    });
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Abstract background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] -z-10 rounded-full" />

      <motion.div 
        layout
        className="w-full max-w-xl glass-card p-12 text-center"
      >
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Zap className="text-primary" size={40} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-4 tracking-tight">Master Your Focus</h1>
              <p className="text-white/50 text-lg">
                Smart Focus Pro combines deep work principles with AI-powered distraction interception.
              </p>
            </div>
            <button onClick={() => setStep(2)} className="btn-primary w-full text-lg py-4">
              Get Started
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">What are your goals?</h2>
              <p className="text-white/40">Select at least two to calibrate the AI coach.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <GoalOption 
                label="Deep Work" 
                icon={<Target size={20} />} 
                selected={goals.includes('deep')} 
                onClick={() => setGoals(prev => prev.includes('deep') ? prev.filter(g => g !== 'deep') : [...prev, 'deep'])}
              />
              <GoalOption 
                label="Less Socials" 
                icon={<Shield size={20} />} 
                selected={goals.includes('social')} 
                onClick={() => setGoals(prev => prev.includes('social') ? prev.filter(g => g !== 'social') : [...prev, 'social'])}
              />
              <GoalOption 
                label="Flow State" 
                icon={<Zap size={20} />} 
                selected={goals.includes('flow')} 
                onClick={() => setGoals(prev => prev.includes('flow') ? prev.filter(g => g !== 'flow') : [...prev, 'flow'])}
              />
              <GoalOption 
                label="Better Breaks" 
                icon={<Coffee size={20} />} 
                selected={goals.includes('breaks')} 
                onClick={() => setGoals(prev => prev.includes('breaks') ? prev.filter(g => g !== 'breaks') : [...prev, 'breaks'])}
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
              <button 
                onClick={handleComplete} 
                disabled={goals.length < 1}
                className={`flex-1 btn-primary ${goals.length < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Complete Setup
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const GoalOption = ({ label, icon, selected, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 relative overflow-hidden ${
      selected ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-white/20'
    }`}
  >
    <div className={`${selected ? 'text-primary' : 'text-white/40'}`}>
      {icon}
    </div>
    <span className="font-medium">{label}</span>
    {selected && (
      <div className="absolute top-2 right-2 text-primary">
        <Check size={16} />
      </div>
    )}
  </button>
);

export default Onboarding;
