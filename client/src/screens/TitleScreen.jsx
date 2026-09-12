import React from 'react';
import { motion } from 'framer-motion';
import { DoorOpen, Flame, Sparkles, Shield } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundFx } from '../services/audio';
import EmberParticles from '../components/EmberParticles';

export default function TitleScreen() {
  const { setCurrentScreen, serverStatus } = useGame();

  const handleEnterTavern = () => {
    soundFx.playClick();
    soundFx.startTavernAmbience();
    setCurrentScreen('character_select');
  };

  const isLiveAI = serverStatus?.mode === 'live-gemini-ai' || serverStatus?.hasKey;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#0a0704] text-tavern-parchment select-none overflow-hidden">
      {/* Layer 1: Ambient Radial Candle & Hearth Glow */}
      <div className="absolute inset-0 bg-radial-gradient from-tavern-amber/20 via-tavern-darkest/95 to-[#0a0704] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />

      {/* Layer 2: Floating Ember Particles */}
      <EmberParticles count={8} />

      {/* Layer 3: Main Title Hero Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-lg w-full text-center space-y-7 px-4"
      >
        {/* Emblem Top */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <div className="relative p-4 rounded-full bg-tavern-wood/90 border-2 border-tavern-gold shadow-[0_0_35px_rgba(212,165,116,0.35)]">
            <Flame className="w-10 h-10 text-tavern-glow animate-flicker" />
            <Sparkles className="w-4 h-4 text-tavern-gold absolute top-2 right-2 animate-pulse" />
          </div>
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div variants={itemVariants} className="space-y-2.5">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-cinzel font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-tavern-glow via-tavern-gold to-tavern-amber drop-shadow-md animate-shimmer">
            The Wayward Flagon
          </h1>
          <p className="text-xs sm:text-sm font-cinzel tracking-[0.2em] uppercase text-tavern-parchment/60 font-medium">
            An AI Dungeon Master Experience
          </p>
          <div className="w-32 mx-auto gradient-divider my-3" />
          <p className="text-xs sm:text-sm text-tavern-parchment/75 max-w-md mx-auto leading-relaxed font-sans pt-1">
            Pull up a chair by the hearth. Forge your hero, recruit companions, and explore dynamic realms where the AI Dungeon Master weaves your tale through dice, danger, and destiny.
          </p>
        </motion.div>

        {/* Primary CTA Button */}
        <motion.div variants={itemVariants} className="pt-3 max-w-xs mx-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleEnterTavern}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-base shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 border border-tavern-glow/50"
          >
            <DoorOpen className="w-5 h-5 text-tavern-darkest" />
            <span>Enter the Tavern</span>
          </motion.button>
        </motion.div>

        {/* Server Status Indicator */}
        <motion.div variants={itemVariants} className="pt-4 flex items-center justify-center gap-2 text-xs font-sans text-tavern-parchment/50">
          <span className={`w-2 h-2 rounded-full ${isLiveAI ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>
            {isLiveAI ? 'AI Dungeon Master Online' : 'Smart Simulation Engine Active'}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
