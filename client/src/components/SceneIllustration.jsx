import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles, Image as ImageIcon, Compass } from 'lucide-react';

export default function SceneIllustration({
  sceneImageUrl,
  fallbackImageUrl,
  fallbackGradient,
  location = 'The Dungeon Vaults',
  mood = 'tense',
  isLoading = false
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const displayUrl = sceneImageUrl || fallbackImageUrl;

  useEffect(() => {
    setImgLoaded(false);
  }, [displayUrl]);

  return (
    <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] rounded-2xl overflow-hidden border-2 border-tavern-gold/50 shadow-candle-lg bg-tavern-darkest select-none group">
      {/* Background Gradient Fallback */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            fallbackGradient ||
            'radial-gradient(circle at 50% 30%, #2b1810 0%, #140804 70%, #050201 100%)'
        }}
      />

      {/* Atmospheric Vignette & Candlelight Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-tavern-darkest/90 via-transparent to-black/40 pointer-events-none z-10" />
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] pointer-events-none z-10" />

      {/* Dynamic Scene Image with Smooth Crossfade & Ken Burns Motion */}
      <AnimatePresence mode="wait">
        {displayUrl && (
          <motion.img
            key={displayUrl}
            src={displayUrl}
            alt={location}
            onLoad={() => setImgLoaded(true)}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{
              opacity: imgLoaded ? 1 : 0.4,
              scale: 1.0,
              transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
            }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
      </AnimatePresence>

      {/* Shimmer Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-tavern-darkest/60 backdrop-blur-xs">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tavern-wood/90 border border-tavern-amber/60 text-xs font-cinzel text-tavern-glow shadow-candle animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-tavern-gold animate-spin" />
            <span>Illustrating Environment...</span>
          </div>
        </div>
      )}

      {/* Floating Location Badge */}
      <div className="absolute top-2.5 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-tavern-darkest/85 backdrop-blur-md border border-tavern-gold/40 text-xs font-cinzel text-tavern-glow shadow-candle">
        <MapPin className="w-3.5 h-3.5 text-tavern-gold" />
        <span className="font-bold truncate max-w-[200px] sm:max-w-none">{location}</span>
      </div>

      {/* Ambient Mood Indicator */}
      <div className="absolute top-2.5 right-3 z-20 px-2.5 py-0.5 rounded-full bg-tavern-darkest/80 border border-tavern-amber/30 text-[10px] font-cinzel text-tavern-gold/80 uppercase tracking-widest hidden sm:block">
        {mood}
      </div>
    </div>
  );
}
