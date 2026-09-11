import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, RefreshCw, Wand2 } from 'lucide-react';

const getArchetypeFallback = (cls) => {
  const c = (cls || '').toLowerCase();
  if (c.includes('bard')) return '/assets/images/archetypes/bard.jpg';
  if (c.includes('cleric') || c.includes('paladin')) return '/assets/images/archetypes/cleric.jpg';
  if (c.includes('mage') || c.includes('wizard') || c.includes('sorcerer') || c.includes('warlock')) return '/assets/images/archetypes/mage.jpg';
  if (c.includes('ranger') || c.includes('druid')) return '/assets/images/archetypes/ranger.jpg';
  if (c.includes('rogue') || c.includes('thief') || c.includes('monk')) return '/assets/images/archetypes/rogue.jpg';
  return '/assets/images/archetypes/warrior.jpg';
};

export default function PortraitDisplay({
  portraitUrl,
  characterClass = 'Warrior',
  name = 'Adventurer',
  size = 'md',
  isLoading = false
}) {
  const localDefault = getArchetypeFallback(characterClass);
  const [activeSrc, setActiveSrc] = useState(portraitUrl || localDefault);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (portraitUrl) {
      setActiveSrc(portraitUrl);
      setImgLoaded(false);
      setHasError(false);
    } else {
      setActiveSrc(getArchetypeFallback(characterClass));
      setImgLoaded(true);
      setHasError(false);
    }
  }, [portraitUrl, characterClass]);

  const handleImageError = () => {
    const fallback = getArchetypeFallback(characterClass);
    if (activeSrc !== fallback) {
      setActiveSrc(fallback);
    } else if (activeSrc.endsWith('.jpg')) {
      setActiveSrc(fallback.replace('.jpg', '.svg'));
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


