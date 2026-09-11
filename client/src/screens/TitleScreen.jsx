import React from 'react';
import { Sparkles, Flame, Shield, Play, RotateCcw, Volume2, Compass } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundFx } from '../services/audio';

export default function TitleScreen() {
  const { setCurrentScreen, loadGame, hasSaveGame, startNewGame } = useGame();

  const handleContinue = () => {
    soundFx.playClick();
    soundFx.startTavernAmbience();
    const loaded = loadGame();
    if (!loaded) {
      startNewGame();
    }
  };

  const handleNewGame = () => {
    soundFx.playClick();
    soundFx.startTavernAmbience();
    startNewGame();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 candle-glow-bg overflow-hidden">
      {/* Background Ambience Layers */}
      <div className="absolute inset-0 bg-radial-gradient from-tavern-umber/40 via-tavern-darkest/90 to-tavern-darkest pointer-events-none" />

      {/* Floating ember particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-tavern-glow animate-float" />
        <div className="absolute top-2/3 left-1/3 w-3 h-3 rounded-full bg-tavern-amber animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-tavern-gold animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-tavern-glow animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Main Title Hero Card */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-8">
        {/* Emblem Top */}
        <div className="flex justify-center">
          <div className="relative p-4 rounded-full bg-tavern-wood border-2 border-tavern-gold shadow-candle">
            <Flame className="w-10 h-10 text-tavern-glow animate-flicker" />
            <Sparkles className="w-4 h-4 text-tavern-gold absolute top-2 right-2 animate-pulse" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-cinzel font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-tavern-glow via-tavern-gold to-tavern-amber drop-shadow-md">
            The Wayward Flagon
          </h1>
          <p className="text-sm sm:text-base font-cinzel tracking-widest text-tavern-gold/90 uppercase">
            An AI Dungeon Master Tabletop RPG
          </p>
          <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-tavern-gold to-transparent" />
          <p className="text-xs sm:text-sm text-tavern-parchment/80 max-w-md mx-auto leading-relaxed font-sans pt-1">
            Pull up a chair by the hearth. Forge your hero, accept quests from the tavern notice board, and let the AI Dungeon Master guide your freeform journey through dice and danger.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-4 max-w-xs mx-auto">
          {hasSaveGame() && (
            <button
              onClick={handleContinue}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-base shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Continue Adventure</span>
            </button>
          )}

          <button
            onClick={handleNewGame}
            className={`w-full py-3.5 px-6 rounded-xl font-cinzel font-bold text-base shadow-parchment active:scale-95 transition-all flex items-center justify-center gap-2.5 ${
              hasSaveGame()
                ? 'bg-tavern-wood hover:bg-tavern-umber text-tavern-glow border border-tavern-gold/50'
                : 'bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest shadow-candle hover:brightness-110'
            }`}
          >
            <Play className="w-5 h-5" />
            <span>Enter the Tavern</span>
          </button>
        </div>

        {/* Feature Highlights Footer */}
        <div className="grid grid-cols-3 gap-2 pt-6 border-t border-tavern-amber/30 text-[11px] font-cinzel text-tavern-gold/80">
          <div className="flex flex-col items-center">
            <Compass className="w-4 h-4 text-tavern-glow mb-1" />
            <span>Living AI Story</span>
          </div>
          <div className="flex flex-col items-center">
            <Shield className="w-4 h-4 text-tavern-glow mb-1" />
            <span>Animated D20 Checks</span>
          </div>
          <div className="flex flex-col items-center">
            <Flame className="w-4 h-4 text-tavern-glow mb-1" />
            <span>Interactive Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
}
