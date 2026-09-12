import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Coins, Gift, Skull, Compass, Shield, Flame, Sparkles } from 'lucide-react';
import { soundFx } from '../services/audio';

export default function CampaignCard({ campaign, onSelect, isCustomArchitect = false }) {
  if (isCustomArchitect) {
    return (
      <div className="relative rounded-2xl bg-gradient-to-b from-purple-950/40 via-stone-950/80 to-black border-2 border-dashed border-purple-500/30 p-6 flex flex-col justify-between h-[360px] opacity-75 select-none overflow-hidden">
        {/* Subtle corner accents */}
        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-purple-400/50" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-purple-400/50" />
        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-purple-400/50" />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-purple-400/50" />

        <div className="space-y-4 text-center my-auto">
          <div className="w-16 h-16 rounded-full bg-purple-900/30 border border-purple-400/40 mx-auto flex items-center justify-center text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-xl text-purple-200 tracking-wider">
              The Arcane Architect
            </h3>
            <p className="text-xs font-cinzel text-purple-300/70 tracking-widest uppercase mt-0.5">
              Commission a Bespoke Campaign
            </p>
            <p className="text-xs text-tavern-parchment/60 font-sans max-w-xs mx-auto mt-2 leading-relaxed">
              Describe any fantasy realm prompt, climate, or nemesis arc to generate a dynamic custom campaign.
            </p>
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[11px] font-cinzel font-bold tracking-widest uppercase">
            🔮 Coming Soon
          </span>
        </div>
      </div>
    );
  }

  const { title, description, tag, difficulty = 'Adept', rewardGold, rewardItem, sceneType = 'crypt' } = campaign;

  // Scene-specific theme gradients and icons
  const getSceneStyle = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'forest':
        return {
          gradient: 'from-emerald-950/60 via-stone-950/90 to-black',
          border: 'border-emerald-500/30 hover:border-emerald-400/60',
          accent: 'text-emerald-400',
          icon: '🌲'
        };
      case 'cove':
        return {
          gradient: 'from-teal-950/60 via-stone-950/90 to-black',
          border: 'border-teal-500/30 hover:border-teal-400/60',
          accent: 'text-teal-400',
          icon: '🌊'
        };
      case 'mountains':
      case 'volcano':
        return {
          gradient: 'from-red-950/60 via-stone-950/90 to-black',
          border: 'border-red-500/30 hover:border-red-400/60',
          accent: 'text-red-400',
          icon: '🌋'
        };
      case 'village':
      case 'tavern':
        return {
          gradient: 'from-amber-950/60 via-stone-950/90 to-black',
          border: 'border-amber-500/30 hover:border-amber-400/60',
          accent: 'text-amber-400',
          icon: '🍺'
        };
      case 'crypt':
      default:
        return {
          gradient: 'from-purple-950/60 via-stone-950/90 to-black',
          border: 'border-purple-500/30 hover:border-purple-400/60',
          accent: 'text-purple-400',
          icon: '💀'
        };
    }
  };

  const getDifficultyBadge = (diff) => {
    switch ((diff || '').toLowerCase()) {
      case 'novice':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'adept':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'challenging':
        return 'bg-orange-950/80 text-orange-300 border-orange-500/40';
      case 'deadly':
        return 'bg-red-950/80 text-red-300 border-red-500/40';
      default:
        return 'bg-stone-900 text-stone-300 border-stone-600';
    }
  };

  const sceneStyle = getSceneStyle(sceneType);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative rounded-2xl bg-gradient-to-b ${sceneStyle.gradient} border ${sceneStyle.border} p-5 flex flex-col justify-between h-[360px] shadow-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,165,116,0.15)] overflow-hidden`}
    >
      {/* 4 Ornate L-shaped Gold Corner Brackets */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-tavern-glow z-10 pointer-events-none rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-tavern-glow z-10 pointer-events-none rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-tavern-glow z-10 pointer-events-none rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-tavern-glow z-10 pointer-events-none rounded-br-sm" />

      {/* Card Header: Icon & Tags */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sceneStyle.icon}</span>
            <span className="text-[11px] font-cinzel font-bold text-tavern-gold/80 tracking-widest uppercase">
              {tag || 'Adventure'}
            </span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-cinzel font-bold uppercase tracking-wider ${getDifficultyBadge(difficulty)}`}>
            {difficulty}
          </span>
        </div>

        <div>
          <h3 className="font-cinzel font-bold text-lg sm:text-xl text-tavern-glow tracking-wide group-hover:text-amber-200 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-tavern-parchment/75 font-sans leading-relaxed line-clamp-3 mt-1.5">
            {description}
          </p>
        </div>
      </div>

      {/* Card Footer: Rewards & Embark CTA */}
      <div className="space-y-3 pt-3 border-t border-tavern-gold/15">
        {/* Rewards Row */}
        <div className="flex items-center gap-3 text-xs font-mono text-tavern-parchment/90">
          <span className="text-tavern-parchment/50 font-sans text-[11px]">Rewards:</span>
          {rewardGold && (
            <span className="flex items-center gap-1 text-tavern-glow font-bold">
              <Coins className="w-3.5 h-3.5 text-tavern-gold" /> +{rewardGold}g
            </span>
          )}
          {rewardItem && (
            <span className="flex items-center gap-1 text-tavern-gold truncate max-w-[160px]" title={rewardItem}>
              <Gift className="w-3.5 h-3.5 shrink-0" /> {rewardItem}
            </span>
          )}
        </div>

        {/* Embark Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onSelect?.(campaign);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-xs tracking-wider shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Embark on this Chronicle</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
