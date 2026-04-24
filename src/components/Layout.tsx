import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Shield, BarChart3, Settings as SettingsIcon, LogOut, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import Dashboard from './Dashboard';
import FocusTimer from './FocusTimer';
import Settings from './Settings';
import Onboarding from './Onboarding';
import Report from './Report';
import InterceptModal from './InterceptModal';
import PainMomentModal from './PainMomentModal';

const Layout: React.FC = () => {
  const user = useStore(state => state.user);
  const isActive = useStore(state => state.isActive);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timer' | 'report' | 'settings'>('dashboard');
  const [showInterceptDemo, setShowInterceptDemo] = useState(false);
  const [showPainDemo, setShowPainDemo] = useState(false);

  if (!user) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-24 flex flex-col items-center py-8 glass border-r border-white/5 z-40">
        <div className="mb-12">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="text-white" size={28} />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<BarChart3 />} 
            label="Home" 
          />
          <NavButton 
            active={activeTab === 'timer'} 
            onClick={() => setActiveTab('timer')} 
            icon={<Clock />} 
            label="Focus" 
          />
          <NavButton 
            active={activeTab === 'report'} 
            onClick={() => setActiveTab('report')} 
            icon={<CheckCircle2 />} 
            label="Report" 
          />
        </div>

        <div className="flex flex-col gap-6 mt-auto">
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<SettingsIcon />} 
            label="Settings" 
          />
          <div className="flex flex-col gap-2">
            <button 
              className="text-white/40 hover:text-white transition-colors p-3 bg-white/5 rounded-xl text-xs"
              title="Demonstrate Intent Interception"
              onClick={() => setShowInterceptDemo(true)}
            >
              <Shield size={20} className="mx-auto mb-1" />
              Intent
            </button>
            <button 
              className="text-red-400/60 hover:text-red-400 transition-colors p-3 bg-red-400/5 rounded-xl text-xs"
              title="Demonstrate Pain Moment"
              onClick={() => setShowPainDemo(true)}
            >
              <Shield size={20} className="mx-auto mb-1" />
              Pain
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-24 pt-8 pb-32 max-w-6xl mx-auto px-8">
        <header className="flex justify-between items-end mb-12">
          <div className="flex-1">
            <h1 className="text-4xl font-black tracking-tighter leading-none mb-2">
              {activeTab === 'dashboard' && (isActive ? "Shield Active." : "Focus Ready.")}
              {activeTab === 'timer' && "Focus Timer"}
              {activeTab === 'report' && "Focus Score"}
              {activeTab === 'settings' && "Settings"}
            </h1>
            <p className="text-white/50 font-medium tracking-wide">
              {activeTab === 'dashboard' && (isActive ? "12 interruptions blocked. Maintaining flow." : "12 interruptions blocked today. Start again?")}
              {activeTab === 'timer' && "Single-tasking is your competitive advantage."}
              {activeTab === 'report' && "Focus habits analyzed."}
              {activeTab === 'settings' && "Configure your environment."}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {isActive ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="bg-accent/10 border border-accent/20 px-5 py-2.5 rounded-2xl flex items-center gap-3 cursor-pointer group hover:bg-accent/20 transition-all shadow-[0_0_20px_rgba(0,209,178,0.1)]"
                onClick={() => setActiveTab('timer')}
              >
                <div className="relative">
                  <div className="w-3 h-3 bg-accent rounded-full animate-ping absolute inset-0" />
                  <div className="w-3 h-3 bg-accent rounded-full relative" />
                </div>
                <div className="flex flex-col">
                  <span className="text-accent text-xs font-black uppercase tracking-widest leading-none">Session Active</span>
                  <span className="text-[10px] text-white/40 font-bold group-hover:text-white/60 transition-colors">Return to Flow &rarr;</span>
                </div>
              </motion.div>
            ) : (
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all cursor-help" title="Weekly Progress">
                  <BarChart3 size={18} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all cursor-help" title="Alerts">
                  <Shield size={18} />
                </div>
              </div>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'timer' && <FocusTimer />}
            {activeTab === 'report' && <Report />}
            {activeTab === 'settings' && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Intercept Demo Overlay */}
      <AnimatePresence>
        {showInterceptDemo && (
          <InterceptModal 
            url="youtube.com" 
            onClose={() => setShowInterceptDemo(false)} 
          />
        )}
        {showPainDemo && (
          <PainMomentModal 
            url="tiktok.com" 
            count={14}
            totalToday={28}
            onClose={() => setShowPainDemo(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl transition-all relative group flex flex-col items-center gap-1 ${
      active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    {active && (
      <motion.div 
        layoutId="nav-glow"
        className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl -z-10"
      />
    )}
  </button>
);

export default Layout;
