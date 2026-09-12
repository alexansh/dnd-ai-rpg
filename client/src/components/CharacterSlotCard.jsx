import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Coins, ArrowRight, Trash2, Shield, MapPin, Sparkles } from 'lucide-react';
import { soundFx } from '../services/audio';

const getArchetypeFallback = (cls) => {
  const c = (cls || '').toLowerCase();
  if (c.includes('bard')) return '/assets/images/archetypes/bard.jpg';
  if (c.includes('cleric') || c.includes('paladin')) return '/assets/images/archetypes/cleric.jpg';
  if (c.includes('mage') || c.includes('wizard') || c.includes('sorcerer') || c.includes('warlock')) return '/assets/images/archetypes/mage.jpg';
  if (c.includes('ranger') || c.includes('druid')) return '/assets/images/archetypes/ranger.jpg';
  if (c.includes('rogue') || c.includes('thief') || c.includes('monk')) return '/assets/images/archetypes/rogue.jpg';
  return '/assets/images/archetypes/warrior.jpg';
};

function formatRelativeTime(dateString) {
  if (!dateString) return 'Recently';
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export default function CharacterSlotCard({ slot, onSelect, onDelete }) {
  const { character, campaign, currentLocation, lastPlayed } = slot;
  const [imgError, setImgError] = useState(false);

  const fallbackSrc = getArchetypeFallback(character?.class);
  const portraitSrc = !imgError && character?.portraitUrl ? character.portraitUrl : fallbackSrc;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-full h-[410px] rounded-2xl bg-gradient-to-b from-stone-900/85 via-stone-950/95 to-black border border-tavern-gold/25 hover:border-tavern-gold/60 shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,165,116,0.18)]"
    >
      {/* 4 Ornate Gold Corner Brackets */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-tavern-glow z-20 pointer-events-none rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-tavern-glow z-20 pointer-events-none rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-tavern-glow z-20 pointer-events-none rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-tavern-glow z-20 pointer-events-none rounded-br-sm" />

      {/* Delete Button (Visible on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          soundFx.playClick();
          onDelete?.(slot.slotId);
        }}
        title="Abandon Hero"
        className="absolute top-3 right-3 z-30 p-1.5 rounded-lg bg-black/70 hover:bg-red-950/90 text-tavern-parchment/60 hover:text-red-300 border border-tavern-gold/20 hover:border-red-500/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Top Half: Full Bleed Portrait with Gradient Overlay */}
      <div className="relative w-full h-[52%] overflow-hidden bg-stone-950">
        <img
          src={portraitSrc}
          alt={character?.name || 'Hero'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Dark Vignette and Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        
        {/* Location Tag */}
        <div className="absolute bottom-2 left-3 z-10 flex items-center gap-1 text-[11px] font-sans text-tavern-parchment/70 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-tavern-gold/20">
          <MapPin className="w-3 h-3 text-tavern-glow shrink-0" />
          <span className="truncate max-w-[180px]">{currentLocation || 'The Wayward Flagon'}</span>
        </div>
      </div>

      {/* Bottom Half: Character Info & Actions */}
      <div className="relative z-10 p-4 pt-1 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Name & Class Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-cinzel font-bold text-lg text-tavern-glow tracking-wide truncate max-w-[200px]">
                {character?.name || 'Valiant Hero'}
              </h3>
              <p className="text-xs font-cinzel tracking-widest text-tavern-gold uppercase">
                Level 1 {character?.race || ''} {character?.class || 'Adventurer'}
              </p>
            </div>
            <span className="text-[10px] text-tavern-parchment/50 font-sans mt-1 shrink-0">
              {formatRelativeTime(lastPlayed)}
            </span>
          </div>

          {/* Compact Stat & Economy Row */}
          <div className="flex items-center gap-4 py-2 border-y border-tavern-gold/15 my-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <Heart className="w-3.5 h-3.5 fill-red-400" />
              <span>{character?.hp || 20}/{character?.maxHp || 20} HP</span>
            </div>
            <div className="flex items-center gap-1.5 text-tavern-glow font-bold">
              <Coins className="w-3.5 h-3.5 text-tavern-gold" />
              <span>{character?.gold || 0}g</span>
            </div>
          </div>

          {/* Campaign Tag */}
          <div className="text-xs text-tavern-parchment/80 font-sans italic truncate">
            📜 {campaign?.title || 'The Wayward Chronicle'}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onSelect?.(slot.slotId);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-xs tracking-wider shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Continue Journey</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
