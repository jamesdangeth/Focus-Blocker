import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PainMomentModalProps {
  url: string;
  count: number;
  totalToday: number;
  onClose: () => void;
}

const PainMomentModal: React.FC<PainMomentModalProps> = ({ url, count, totalToday, onClose }) => {
  const hoursLost = ((totalToday * 5) / 60).toFixed(1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F1226]/95 backdrop-blur-md"
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-xl bg-white/5 border border-red-400/20 p-14 rounded-[32px] text-center shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
      >
        <div className="bg-red-400/10 text-red-500 inline-flex p-3 rounded-[20px] mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        
        <h1 className="text-4xl font-extrabold mb-3 leading-tight tracking-tight text-white">
          You opened <span className="text-red-400">{url}</span> {count} times today.
        </h1>
        
        <p className="text-white/50 text-xl mb-10">
          That's <strong className="text-white">~{hoursLost} hours</strong> lost.
        </p>
        
        <div className="flex flex-col gap-4 w-full">
          <button 
            onClick={onClose}
            className="w-full bg-white text-[#0F1226] border-none p-5 rounded-2xl font-bold text-lg cursor-pointer hover:scale-[0.98] transition-transform"
          >
            Resume Focus
          </button>
          
          <button 
            onClick={() => {
              alert("Opening Settings / Premium options...");
              onClose();
            }}
            className="w-full bg-gradient-to-br from-[#FFD700] to-[#FDB931] text-[#0F1226] border-none p-4 rounded-2xl font-bold text-[15px] cursor-pointer shadow-[0_8px_20px_rgba(253,185,49,0.3)] hover:scale-[0.98] transition-transform"
          >
            ✨ Fix my habits
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PainMomentModal;
