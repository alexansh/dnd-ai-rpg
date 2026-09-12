import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, RefreshCw, Wand2 } from 'lucide-react';

const getRaceClassFallback = (race = 'human', cls = 'Warrior') => {
  const r = (race || '').toLowerCase();
  const c = (cls || '').toLowerCase();

  // If human, use static archetype photos if available
  if (r.includes('human') || (!r && !c.includes('elf') && !c.includes('dwarf') && !c.includes('tiefling') && !c.includes('dragonborn') && !c.includes('orc') && !c.includes('halfling'))) {
    if (c.includes('bard')) return '/assets/images/archetypes/bard.jpg';
    if (c.includes('cleric') || c.includes('paladin')) return '/assets/images/archetypes/cleric.jpg';
    if (c.includes('mage') || c.includes('wizard') || c.includes('sorcerer') || c.includes('warlock')) return '/assets/images/archetypes/mage.jpg';
    if (c.includes('ranger') || c.includes('druid')) return '/assets/images/archetypes/ranger.jpg';
    if (c.includes('rogue') || c.includes('thief') || c.includes('monk')) return '/assets/images/archetypes/rogue.jpg';
    return '/assets/images/archetypes/warrior.jpg';
  }

  // Generate race-accurate procedural SVG data URI
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

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function PortraitDisplay({
  portraitUrl,
  race = 'Human',
  characterClass = 'Warrior',
  name = 'Adventurer',
  size = 'md',
  isLoading = false
}) {
  const localDefault = getRaceClassFallback(race, characterClass);
  const [activeSrc, setActiveSrc] = useState(portraitUrl || localDefault);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (portraitUrl) {
      setActiveSrc(portraitUrl);
      setImgLoaded(false);
      setHasError(false);
    } else {
      setActiveSrc(getRaceClassFallback(race, characterClass));
      setImgLoaded(true);
      setHasError(false);
    }
  }, [portraitUrl, race, characterClass]);

  const handleImageError = () => {
    const fallback = getRaceClassFallback(race, characterClass);
    if (activeSrc !== fallback) {
      setActiveSrc(fallback);
    } else {
      setHasError(true);
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-48 h-48 sm:w-60 sm:h-60',
    full: 'w-full aspect-square'
  }[size] || 'w-28 h-28';

  return (
    <div className="relative group inline-block">
      {/* Outer Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow rounded-xl blur-sm opacity-60 group-hover:opacity-85 transition duration-500"></div>

      {/* Ornate Inner Frame */}
      <div className={`relative ${sizeClasses} rounded-xl overflow-hidden bg-tavern-darkest border-2 border-tavern-gold shadow-parchment flex items-center justify-center`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-tavern-glow p-4 text-center">
            <Sparkles className="w-8 h-8 mb-2 text-tavern-glow animate-spin" />
            <span className="text-xs font-cinzel font-bold text-tavern-gold animate-pulse">Weaving Portrait...</span>
            <span className="text-[10px] text-tavern-parchment/60 font-sans mt-0.5">Capturing tavern light</span>
          </div>
        ) : activeSrc && !hasError ? (
          <>
            <img
              key={activeSrc}
              src={activeSrc}
              alt={`${name} portrait`}
              onLoad={() => setImgLoaded(true)}
              onError={handleImageError}
              className={`w-full h-full object-cover object-center transition-all duration-500 ${
                imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
            {!imgLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-tavern-darkest/90 text-tavern-gold/80 p-2 text-center">
                <RefreshCw className="w-7 h-7 animate-spin text-tavern-gold mb-1" />
                <span className="text-[11px] font-cinzel">Loading Canvas...</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-tavern-gold/70 p-3 text-center">
            <Wand2 className="w-8 h-8 mb-1.5 text-tavern-gold/80" />
            <span className="text-xs font-cinzel font-bold text-tavern-parchment">{name || 'Adventurer'}</span>
            <span className="text-[10px] font-mono text-tavern-gold/60 uppercase tracking-wide">{characterClass}</span>
          </div>
        )}

        {/* Subtle corner flourishes */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-tavern-glow pointer-events-none" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-tavern-glow pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-tavern-glow pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-tavern-glow pointer-events-none" />
      </div>
    </div>
  );
}


