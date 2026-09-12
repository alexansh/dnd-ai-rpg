import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Coins, ArrowRight, Trash2, Shield, MapPin, Sparkles } from 'lucide-react';
import { soundFx } from '../services/audio';

const getRaceClassFallback = (race = 'human', cls = 'Warrior') => {
  const r = (race || '').toLowerCase();
  const c = (cls || '').toLowerCase();

  if (r.includes('human') || (!r && !c.includes('elf') && !c.includes('dwarf') && !c.includes('tiefling') && !c.includes('dragonborn') && !c.includes('orc') && !c.includes('halfling'))) {
    if (c.includes('bard')) return '/assets/images/archetypes/bard.jpg';
    if (c.includes('cleric') || c.includes('paladin')) return '/assets/images/archetypes/cleric.jpg';
    if (c.includes('mage') || c.includes('wizard') || c.includes('sorcerer') || c.includes('warlock')) return '/assets/images/archetypes/mage.jpg';
    if (c.includes('ranger') || c.includes('druid')) return '/assets/images/archetypes/ranger.jpg';
    if (c.includes('rogue') || c.includes('thief') || c.includes('monk')) return '/assets/images/archetypes/rogue.jpg';
    return '/assets/images/archetypes/warrior.jpg';
  }

  let raceKey = 'human';
  if (r.includes('dragonborn') || c.includes('dragonborn')) raceKey = 'dragonborn';
  else if (r.includes('tiefling') || c.includes('tiefling')) raceKey = 'tiefling';
  else if (r.includes('orc') || c.includes('orc')) raceKey = 'half_orc';
  else if (r.includes('dwarf') || c.includes('dwarf')) raceKey = 'dwarf';
  else if (r.includes('elf') || c.includes('elf')) raceKey = 'elf';
  else if (r.includes('halfling') || c.includes('halfling')) raceKey = 'halfling';

  let raceElements = '';
  let skinTone = '#3a1c0e';

  if (raceKey === 'tiefling') {
    skinTone = '#4a1525';
    raceElements = `
      <path d="M165 140 C135 95 110 65 85 75 C70 85 90 115 125 130" stroke="#d4a574" stroke-width="8" stroke-linecap="round" fill="none" />
      <path d="M235 140 C265 95 290 65 315 75 C330 85 310 115 275 130" stroke="#d4a574" stroke-width="8" stroke-linecap="round" fill="none" />
      <circle cx="188" cy="172" r="3.5" fill="#ff7700" />
      <circle cx="212" cy="172" r="3.5" fill="#ff7700" />
      <polygon points="193,192 195,198 197,192" fill="#f0c987" />
      <polygon points="203,192 205,198 207,192" fill="#f0c987" />
    `;
  } else if (raceKey === 'elf') {
    skinTone = '#3d251e';
    raceElements = `
      <polygon points="160,165 105,135 155,180" fill="#3d251e" stroke="#d4a574" stroke-width="1.5" />
      <polygon points="240,165 295,135 245,180" fill="#3d251e" stroke="#d4a574" stroke-width="1.5" />
      <ellipse cx="188" cy="172" rx="4" ry="2.5" fill="#99f6e4" />
      <ellipse cx="212" cy="172" rx="4" ry="2.5" fill="#99f6e4" />
    `;
  } else if (raceKey === 'dwarf') {
    skinTone = '#422216';
    raceElements = `
      <path d="M165 185 C165 285, 185 310, 200 315 C215 310, 235 285, 235 185 Z" fill="#522a15" stroke="#d4a574" stroke-width="1.5" />
      <rect x="194" y="235" width="12" height="6" rx="2" fill="#d4a574" />
      <rect x="194" y="265" width="12" height="6" rx="2" fill="#d4a574" />
    `;
  } else if (raceKey === 'dragonborn') {
    skinTone = '#2e1c12';
    raceElements = `
      <path d="M175 130 C155 85 135 60 110 50 C125 80 150 110 165 132" stroke="#d4a574" stroke-width="6" stroke-linecap="round" fill="none" />
      <path d="M225 130 C245 85 265 60 290 50 C275 80 250 110 235 132" stroke="#d4a574" stroke-width="6" stroke-linecap="round" fill="none" />
      <ellipse cx="188" cy="172" rx="3.5" ry="5" fill="#facc15" />
      <line x1="188" y1="168" x2="188" y2="176" stroke="#000" stroke-width="1.5" />
      <ellipse cx="212" cy="172" rx="3.5" ry="5" fill="#facc15" />
      <line x1="212" y1="168" x2="212" y2="176" stroke="#000" stroke-width="1.5" />
    `;
  } else if (raceKey === 'half_orc') {
    skinTone = '#242f21';
    raceElements = `
      <polygon points="185,194 188,180 192,194" fill="#fef08a" />
      <polygon points="215,194 212,180 208,194" fill="#fef08a" />
      <path d="M175 162 Q200 155 225 162" stroke="#854d0e" stroke-width="3" fill="none" />
    `;
  } else if (raceKey === 'halfling') {
    skinTone = '#3d2519';
    raceElements = `
      <circle cx="165" cy="130" r="14" fill="#522a15" />
      <circle cx="185" cy="120" r="16" fill="#522a15" />
      <circle cx="215" cy="120" r="16" fill="#522a15" />
      <circle cx="235" cy="130" r="14" fill="#522a15" />
    `;
  }

  const raceBadge = raceKey.replace('_', ' ').toUpperCase();
  const classBadge = (cls || 'ADVENTURER').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <radialGradient id="bgG" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#4a2a1b" /><stop offset="100%" stop-color="#0f0704" />
      </radialGradient>
      <linearGradient id="goldB" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f0c987" /><stop offset="50%" stop-color="#d4a574" /><stop offset="100%" stop-color="#8a5a2e" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#bgG)" />
    <path d="M120 380 C120 280, 150 250, 170 230 C150 215, 145 180, 155 145 C165 110, 235 110, 245 145 C255 180, 250 215, 230 230 C250 250, 280 280, 280 380 Z" fill="#1a0c06" stroke="#4a2a1b" stroke-width="2"/>
    <ellipse cx="200" cy="175" rx="36" ry="46" fill="${skinTone}" opacity="0.95" />
    ${raceElements}
    <rect x="12" y="12" width="376" height="376" rx="8" fill="none" stroke="url(#goldB)" stroke-width="3" />
    <rect x="40" y="340" width="320" height="36" rx="4" fill="#140804" stroke="url(#goldB)" stroke-width="1.5" />
    <text x="200" y="363" text-anchor="middle" fill="#f0c987" font-family="Cinzel, Georgia, serif" font-size="12" font-weight="bold" letter-spacing="2">
      ${raceBadge} • ${classBadge}
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
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

  const fallbackSrc = getRaceClassFallback(character?.race, character?.class);
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
