import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Eye, Shield, Sparkles, Heart, Compass, MessageSquare, AlertCircle } from 'lucide-react';
import { getLoyaltyTier } from '../types/game';
import { soundFx } from '../services/audio';

export default function Scene2DView({
  node,
  sceneImageUrl,
  fallbackImageUrl,
  party = [],
  player,
  onHotspotClick,
  isLoading = false
}) {
  if (!node && !fallbackImageUrl) return null;

  const displayImage = sceneImageUrl || node?.bgImage || fallbackImageUrl || '/assets/images/scenery/crossroads.jpg';
  const hotspots = node?.hotspots || [];

  return (
    <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] rounded-2xl overflow-hidden border-2 border-tavern-gold/60 shadow-candle-lg bg-stone-950 select-none group">
      {/* 1. Backdrop Scene Art with Ambient Lighting */}
      <img
        src={displayImage}
        alt={node?.title || 'Current Location'}
        className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-101"
      />

      {/* Atmospheric Shading & Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/50 pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] pointer-events-none" />

      {/* 2. Top Location & Sensory Premise Banner */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-950/90 backdrop-blur-md border border-tavern-gold/50 shadow-candle pointer-events-auto">
          <MapPin className="w-4 h-4 text-tavern-glow animate-pulse shrink-0" />
          <div className="min-w-0">
            <h3 className="font-cinzel font-bold text-xs sm:text-sm text-tavern-glow truncate">
              {node?.title || 'The Whispering Crossroads'}
            </h3>
            <span className="text-[10px] text-tavern-gold/80 block font-mono">
              {node?.location || 'Act I • Milestone'}
            </span>
          </div>
        </div>

        {node?.ambientMood && (
          <div className="px-2.5 py-1 rounded-lg bg-stone-950/80 border border-stone-700 text-[10px] font-cinzel text-amber-300 uppercase tracking-widest hidden sm:block">
            {node.ambientMood.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* 3. Interactive World Hotspot Pins */}
      {hotspots.map((spot, idx) => {
        // Place pins dynamically across the stage
        const positions = [
          { left: '25%', top: '55%' },
          { left: '50%', top: '45%' },
          { left: '75%', top: '60%' }
        ];
        const pos = positions[idx % positions.length];

        return (
          <div
            key={spot.id}
            style={{ left: pos.left, top: pos.top }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundFx.playClick();
                if (onHotspotClick) onHotspotClick(spot);
              }}
              className="relative group/pin flex flex-col items-center focus:outline-none"
            >
              {/* Pulsing Aura */}
              <div className="absolute inset-0 rounded-full bg-tavern-gold/40 animate-ping pointer-events-none" />

              <div className="p-2 rounded-full bg-stone-950/90 border-2 border-tavern-glow text-tavern-glow shadow-candle-md flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>

              {/* Pin Tooltip */}
              <div className="mt-1 px-2.5 py-0.5 rounded bg-stone-950/95 border border-tavern-amber/60 text-[10px] font-cinzel font-bold text-tavern-parchment whitespace-nowrap shadow-lg flex items-center gap-1 opacity-90 group-hover/pin:opacity-100 transition-opacity">
                <span>{spot.label}</span>
                {spot.check && (
                  <span className="text-[9px] px-1 rounded bg-stone-800 text-amber-400 font-mono">
                    {spot.check} {spot.dc ? `DC${spot.dc}` : ''}
                  </span>
                )}
              </div>
            </motion.button>
          </div>
        );
      })}

      {/* 4. Active Party Presence Bar on Bottom Edge */}
      <div className="absolute bottom-2.5 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {party.map(companion => {
            const loyaltyInfo = getLoyaltyTier(companion.loyalty ?? 50);
            return (
              <div
                key={companion.id}
                className="flex items-center gap-2 px-2 py-1 rounded-xl bg-stone-950/90 backdrop-blur-md border border-stone-800 shadow-md group/comp relative"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-tavern-gold/50 shrink-0">
                  <img src={companion.portraitUrl} alt={companion.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 hidden md:block">
                  <span className="font-cinzel font-bold text-[10px] text-stone-200 block truncate max-w-[80px]">
                    {companion.name.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px]">{loyaltyInfo.icon}</span>
                    <span className={`text-[9px] font-mono font-bold ${loyaltyInfo.color.split(' ')[0]}`}>
                      {companion.loyalty ?? 50}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sensory Premise Excerpt */}
        {node?.sensoryPremise && (
          <div className="hidden lg:block max-w-md p-2 rounded-xl bg-stone-950/85 backdrop-blur-md border border-tavern-amber/40 text-[11px] font-serif text-tavern-parchment/90 italic shadow-candle truncate">
            "{node.sensoryPremise}"
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-tavern-wood border border-tavern-gold/60 text-xs font-cinzel text-tavern-glow shadow-candle animate-pulse">
            <Sparkles className="w-4 h-4 text-tavern-gold animate-spin" />
            <span>Resolving World Consequence...</span>
          </div>
        </div>
      )}
    </div>
  );
}
