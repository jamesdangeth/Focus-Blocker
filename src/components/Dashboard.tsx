import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, BrainCircuit, Timer, Sparkles, Flame, Target, Play, Plus, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';

const Dashboard: React.FC = () => {
  const blockedSites = useStore(state => state.blockedSites);
  const isActive = useStore(state => state.isActive);
  const removeBlockedSite = useStore(state => state.removeBlockedSite);

  return (
    <div className="space-y-8">
      {/* 8. TOP SUMMARY BAR */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-400" size={18} />
            <div className="flex flex-col">
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Sessions</span>
              <span className="text-sm font-bold">3 Today</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Timer className="text-accent" size={18} />
            <div className="flex flex-col">
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Focused</span>
              <span className="text-sm font-bold">2h 30m</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-primary" size={18} />
            <div className="flex flex-col">
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Blocked</span>
              <span className="text-sm font-bold">12 Distractions</span>
            </div>
          </div>
        </div>
        
        {isActive && (
          <div className="flex items-center gap-2 bg-accent/20 text-accent px-3 py-1.5 rounded-full border border-accent/30 animate-pulse transition-all">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span className="text-xs font-bold uppercase">Shield Active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Momentum Banner (Upgraded) */}
        <div className="lg:col-span-3 glass-card bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-primary/20 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-shadow group-hover:shadow-[0_0_40px_rgba(249,115,22,0.6)]"
            >
              <Flame className="text-white" fill="currentColor" size={28} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black tracking-tight">4-Day Streak</h2>
                <span className="text-accent text-xs font-bold bg-accent/10 px-2 py-0.5 rounded border border-accent/20 tracking-widest leading-none">MOMENTUM</span>
              </div>
              <p className="text-white/60 text-sm mt-0.5 tracking-wide italic">Keep it up. You're outperforming 94% of users.</p>
            </div>
          </div>

          <div className="flex-1 max-w-sm w-full mx-auto sm:ml-auto sm:mr-0 mt-4 sm:mt-0 relative z-10">
            <div className="flex justify-between text-xs font-bold mb-2">
              <div className="flex items-center gap-1">
                <span className="text-white/60 uppercase tracking-tighter">Energy Score</span>
                <div className="w-3 h-3 bg-white/5 rounded-full flex items-center justify-center text-[8px] cursor-help border border-white/10" title="Based on focus consistency and deep work duration">?</div>
              </div>
              <span className="text-accent font-black tracking-widest uppercase">Level 12 • Mastery</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden shadow-inner border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_100%] animate-shimmer"
              />
            </div>
            <p className="text-[10px] text-white/30 mt-2 text-right font-medium uppercase tracking-widest">Next milestone: 1,400 XP</p>
          </div>
        </div>

        {/* 9. NEXT BEST ACTION (NEW) */}
        <div className="lg:col-span-1 glass-card bg-primary/5 border-primary/20 flex flex-col p-6 hover:bg-primary/10 transition-colors group">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Recommendation</div>
          <h4 className="text-lg font-bold mb-2 leading-tight">Focus Peak</h4>
          <p className="text-sm text-white/50 mb-6 flex-1 italic">Your focus window is now. A 25-minute session would be effective.</p>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-white text-black font-black rounded-xl shadow-lg shadow-white/10 hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            Start Focus
          </motion.button>
          
          <div className="mt-4 text-[10px] text-white/20 text-center uppercase tracking-widest text-[9px]">
            {isActive ? "Shield active" : "Global distraction lock available"}
          </div>
        </div>

        {/* Stats Overview (Upgraded) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard 
            title="Focus Quality" 
            value="92" 
            subtitle="Deep Flow State"
            icon={<BrainCircuit className="text-primary" />}
            trend="up"
            trendValue="+8%"
            achievement="Top 10% today"
            color="primary"
          />
          <StatCard 
            title="Deep Work" 
            value="4.2h" 
            subtitle="+1.3h vs yesterday"
            icon={<Timer className="text-accent" />}
            trend="up"
            trendValue="+45m"
            achievement="New Daily Personal Best"
            color="accent"
          />
          <StatCard 
            title="Saves" 
            value="24" 
            subtitle="Saved ~3 hours"
            icon={<ShieldAlert className="text-orange-400" />}
            trend="down"
            trendValue="-2"
            achievement="Productivity Defended"
            color="orange"
          />
          <div className="glass-card flex items-center justify-center border-dashed border-white/10 opacity-60 hover:opacity-100 transition-opacity cursor-pointer p-4 group">
             <div className="text-center">
                <Sparkles size={24} className="mx-auto mb-2 text-white/40 group-hover:text-primary transition-colors" />
                <span className="text-xs font-bold text-white/40 group-hover:text-white">Unlock Extended Analytics</span>
             </div>
          </div>
        </div>

        {/* Main Feature Cards (Upgraded) */}
        <div className="lg:col-span-2 glass-card flex flex-col justify-between overflow-hidden relative p-8 group">
          <div className="z-10 relative">
            <div className="flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-xs mb-4">
              <Sparkles size={14} className="animate-pulse" /> AI Analysis
            </div>
            <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-primary transition-colors">Your morning flow is key.</h3>
            <p className="text-white/70 mb-8 max-w-lg text-lg leading-relaxed">
              Focus peaks between 9 AM and 11:30 AM. Social attempts usually spike around 10:15.
            </p>
            <div className="flex flex-wrap gap-4">
               <motion.button 
                whileHover={{ scale: 1.05 }}
                className="bg-primary text-white px-8 py-3.5 rounded-xl font-black hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(108,92,231,0.3)] flex items-center gap-2"
               >
                 <Zap size={18} fill="currentColor" />
                 Turn On Shield
               </motion.button>
               <button className="bg-white/5 border border-white/10 text-white/80 px-6 py-3.5 rounded-xl font-bold hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md">
                 Efficiency Insights
               </button>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-20 text-primary pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <Target size={280} strokeWidth={1} />
          </div>
        </div>

        {/* Quick Blocklist (Upgraded) */}
        <div className="glass-card flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold">Active Shielding</h3>
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Real-time protection</span>
            </div>
            <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white border border-white/5" title="Add site">
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-3 flex-1">
            {blockedSites.slice(0, 4).map((site) => (
              <motion.div 
                key={site} 
                initial={false}
                layout
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all group/item"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 uppercase">
                    {site[0]}
                  </div>
                  <span className="text-sm font-medium">{site}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => removeBlockedSite(site)}
                    className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[10px] font-bold text-red-400 hover:underline"
                  >
                    Unblock
                  </button>
                  <div className="relative w-8 h-4 bg-white/10 rounded-full cursor-pointer overflow-hidden border border-white/5">
                    <div className="absolute right-1 top-1 w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(0,209,178,0.5)]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-3 bg-orange-400/5 rounded-xl border border-orange-400/20">
               <p className="text-[10px] text-orange-400 font-bold text-center italic uppercase tracking-widest">
                Interruption will reset daily progress.
               </p>
            </div>
            <button className="w-full py-4 rounded-xl bg-white text-black font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5">
              Refine Blocklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, trend, trendValue, achievement, color }: any) => (
  <div className={`glass-card relative overflow-hidden group p-6 border-transparent hover:border-${color}-400/30 transition-all duration-500`}>
    <div className={`absolute inset-0 bg-${color}-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 shadow-inner">
        {icon}
      </div>
      <div className={`text-[10px] font-black px-2 py-1 rounded-lg border flex items-center gap-1 uppercase tracking-tighter ${
        trend === 'up' 
          ? 'bg-accent/10 text-accent border-accent/20' 
          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      }`}>
        {trend === 'up' ? '↑' : '↓'} {trendValue}
      </div>
    </div>
    
    <div className="space-y-1 relative z-10">
      <div className="flex items-baseline gap-1">
        <h4 className="text-4xl font-black tracking-tighter">{value}</h4>
        {color === 'accent' && <span className="text-xs font-bold text-white/30">Total</span>}
      </div>
      <p className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">{title}</p>
      
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1">
        <span className="text-[10px] text-white/30 font-medium uppercase tracking-widest mb-1">{subtitle}</span>
        <span className={`text-[11px] font-bold text-${color}-400/80 tracking-tight italic`}>
          "{achievement}"
        </span>
      </div>
    </div>
    
    <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-${color}-400/5 rounded-full blur-3xl group-hover:bg-${color}-400/10 transition-all duration-700`} />
  </div>
);

export default Dashboard;
