import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Lightbulb, TrendingUp, Calendar, ArrowRight, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { generateWeeklyInsights } from '../services/geminiService';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

const Report: React.FC = () => {
  const user = useStore(state => state.user);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiData, setAiData] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Mock logs for the demo
      const mockLogs = [
        { day: 'Mon', focusTime: 120, blocks: 12 },
        { day: 'Tue', focusTime: 180, blocks: 5 },
        { day: 'Wed', focusTime: 90, blocks: 20 },
      ];
      const result = await generateWeeklyInsights(mockLogs);
      setAiData(result);
      toast.success("AI Insights generated successfully");
    } catch (error) {
      toast.error("Failed to generate insights");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Summary */}
      <div className="glass-card bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
        {!aiData && !isGenerating ? (
          <div className="py-12 text-center">
            <Sparkles className="mx-auto text-primary mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Focus Score</h3>
            <p className="text-white/40 mb-8 max-w-md mx-auto">
              Analyze your behavior to find your focus peaks.
            </p>
            <button 
              onClick={handleGenerate}
              className="btn-primary"
            >
              Analyze Habits
            </button>
          </div>
        ) : isGenerating ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <div className="text-xl font-bold text-white/60 animate-pulse tracking-tight">Analyzing habits...</div>
          </div>
        ) : (
          <div className="flex items-start gap-6">
            <div className="p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20">
              <BrainCircuit size={32} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Focus Insights</h3>
                <button 
                  onClick={handleGenerate}
                  className="text-white/20 hover:text-white transition-colors"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              <p className="text-lg text-white/80 leading-relaxed mb-6 italic">
                {aiData.insights[0] || "Focus peaks between 9:00 and 11:30. Successfully blocked 5 interruptions yesterday."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightItem 
                  icon={<Lightbulb className="text-accent" />}
                  title="Pattern Observation"
                  text={aiData.insights[1] || "Impulsive browsing spikes during tasks labeled 'Meeting Preparation'."}
                />
                <InsightItem 
                  icon={<TrendingUp className="text-primary" />}
                  title="Recommendation"
                  text={aiData.recommendations[0] || "Consider a 15-minute 'Distraction Window' at 4 PM."}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Breakdown */}
      <div className="relative">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${user?.plan === 'free' ? 'opacity-30 blur-md pointer-events-none' : ''}`}>
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-6">Consistency</h3>
            <div className="h-48 flex items-end justify-between gap-2 px-2">
              {[45, 60, 30, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                    className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-lg relative group transition-colors"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-bg-dark text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {h}% Focus
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-white/20 font-bold uppercase">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3 className="text-xl font-bold mb-6">Blocked Sites</h3>
            <div className="space-y-4">
              <DomainStat name="youtube.com" count={42} percentage={40} />
              <DomainStat name="twitter.com" count={28} percentage={25} />
              <DomainStat name="reddit.com" count={15} percentage={15} />
              <DomainStat name="instagram.com" count={10} percentage={10} />
            </div>
          </div>
        </div>

        {/* Premium Hook Overlay */}
        {user?.plan === 'free' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto">
            <div className="glass-card text-center p-8 max-w-md border-accent/30 bg-bg-dark/80 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-bg-dark font-bold shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                Pro
              </div>
              <h4 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
                Unlock Full Behavioral Analytics
              </h4>
              <p className="text-white/60 mb-8">
                Upgrade to Premium to reveal deep insights, see exact metrics on your distracted time, and permanently fix your habits.
              </p>
              <button 
                className="w-full bg-gradient-to-br from-yellow-400 to-amber-600 text-bg-dark font-bold text-lg py-4 rounded-xl shadow-[0_8px_20px_rgba(251,191,36,0.3)] hover:scale-[0.98] transition-transform"
                onClick={() => {
                  toast('Redirecting to Stripe...', { icon: '💳' });
                }}
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="glass-card border-accent/20 bg-accent/5">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <SparkleIcon /> 
          Strategic Recommendations
        </h3>
        <div className="space-y-4 font-medium">
          <Recommendation text="Introduce a 15-minute 'Distraction Window' at 4 PM to clear cognitive residue." />
          <Recommendation text="Limit Deep Work sessions to 50 minutes followed by a physical movement break." />
        </div>
      </div>
    </div>
  );
};

const InsightItem = ({ icon, title, text }: any) => (
  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider text-white/40">{title}</span>
    </div>
    <p className="text-sm text-white/70">{text}</p>
  </div>
);

const DomainStat = ({ name, count, percentage }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="font-medium">{name}</span>
      <span className="text-white/40">{count} interceptions</span>
    </div>
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        className="h-full bg-primary" 
      />
    </div>
  </div>
);

const Recommendation = ({ text }: any) => (
  <div className="flex items-start gap-4 p-4 hover:bg-white/5 transition-all rounded-xl cursor-default group">
    <div className="mt-1 text-accent">
      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
    </div>
    <p className="text-white/80">{text}</p>
  </div>
);

const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/>
  </svg>
);

export default Report;
