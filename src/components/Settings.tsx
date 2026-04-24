import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Globe, Shield, RefreshCw, CreditCard } from 'lucide-react';
import { useStore } from '../store/useStore';

const Settings: React.FC = () => {
  const blockedSites = useStore(state => state.blockedSites);
  const addBlockedSite = useStore(state => state.addBlockedSite);
  const removeBlockedSite = useStore(state => state.removeBlockedSite);
  const user = useStore(state => state.user);
  const [newSite, setNewSite] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSite) {
      addBlockedSite(newSite);
      setNewSite('');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        {/* Blocklist Management */}
        <section className="glass-card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold">Focus Shield</h3>
              <p className="text-white/40 text-sm">Websites that trigger the focus shield.</p>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Shield size={24} />
            </div>
          </div>

          <form onSubmit={handleAdd} className="flex gap-2 mb-8">
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="example.com"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <button type="submit" className="bg-primary p-3 rounded-xl hover:opacity-90 transition-all active:scale-95">
              <Plus size={24} />
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blockedSites.map((site) => (
              <motion.div 
                layout
                key={site}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20">
                    <Globe size={14} />
                  </div>
                  <span className="text-sm font-medium">{site}</span>
                </div>
                <button 
                  onClick={() => removeBlockedSite(site)}
                  className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Sync & Backup */}
        <section className="glass-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-accent/10 text-accent rounded-xl">
              <RefreshCw size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Sync Across Devices</h3>
              <p className="text-white/40 text-sm">Sync your settings everywhere you focus.</p>
            </div>
          </div>
          <button className="btn-ghost w-full flex items-center justify-center gap-2">
            Configure Google Sync
          </button>
        </section>
      </div>

      <div className="space-y-8">
        {/* Account Info */}
        <div className="glass-card">
          <h3 className="font-bold mb-4">Your Profile</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-primary">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium truncate max-w-[150px]">{user?.email}</div>
              <div className="text-xs text-primary font-bold uppercase">{user?.plan} PLAN</div>
            </div>
          </div>
          <button className="w-full btn-ghost text-sm mb-2">Change Email</button>
          <button className="w-full text-red-400/60 hover:text-red-400 text-xs text-center py-2">Logout</button>
        </div>

        {/* Premium Upgrade */}
        <div className="glass-card bg-gradient-to-br from-primary/20 to-transparent border-primary/20">
          <CreditCard className="text-primary mb-4" size={32} />
          <h3 className="font-bold mb-2">Upgrade to Pro</h3>
          <ul className="text-sm text-white/60 space-y-2 mb-6">
            <li className="flex items-center gap-2">• AI Intent Detection</li>
            <li className="flex items-center gap-2">• Weekly AI Insights</li>
            <li className="flex items-center gap-2">• Unlimited Blocklist</li>
            <li className="flex items-center gap-2">• Multi-device Sync</li>
          </ul>
          <button className="btn-primary w-full shadow-lg shadow-primary/30">
            Go Premium — $5/mo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
