import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { soundFx } from '../services/audio';

export default function EmptySlotCard({ onClick }) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        soundFx.playClick();
        onClick?.();
      }}
      className="group relative w-full h-[400px] rounded-2xl border-2 border-dashed border-tavern-gold/30 hover:border-tavern-gold/70 bg-black/30 hover:bg-black/45 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-tavern-gold/40"
    >
      {/* Background ambient pulse on hover */}
      <div className="absolute inset-0 bg-radial-gradient from-tavern-amber/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* 4 Corner Accents */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-tavern-gold/30 group-hover:border-tavern-gold/70 transition-colors" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-tavern-gold/30 group-hover:border-tavern-gold/70 transition-colors" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-tavern-gold/30 group-hover:border-tavern-gold/70 transition-colors" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-tavern-gold/30 group-hover:border-tavern-gold/70 transition-colors" />

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-full border border-tavern-gold/30 group-hover:border-tavern-gold/80 bg-tavern-wood/50 flex items-center justify-center text-tavern-gold/40 group-hover:text-tavern-glow group-hover:scale-110 transition-all duration-300 shadow-inner">
          <Plus className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="font-cinzel font-bold text-lg text-tavern-gold/70 group-hover:text-tavern-glow tracking-wider transition-colors">
            Forge a New Hero
          </h3>
          <p className="text-xs text-tavern-parchment/50 font-sans max-w-[200px] leading-relaxed">
            Choose your ancestry, class, and starting chronicle
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tavern-gold/10 border border-tavern-gold/20 text-tavern-gold/80 text-[11px] font-cinzel tracking-widest uppercase group-hover:bg-tavern-gold/20 transition-all">
          <Sparkles className="w-3 h-3 text-tavern-glow animate-pulse" />
          <span>Slot Available</span>
        </div>
      </div>
    </motion.button>
  );
}
