import React, { useState } from 'react';
import { Sparkles, Flame, Shield, Play, RotateCcw, Volume2, Compass, BookOpen, Trash2, X, Clock, MapPin } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundFx } from '../services/audio';

export default function TitleScreen() {
  const {
    loadGame,
    hasSaveGame,
    startNewGame,
    savedSessions,
    refreshSessions,
    deleteSession
  } = useGame();

  const [showSaveList, setShowSaveList] = useState(false);

  const handleContinueLatest = async () => {
    soundFx.playClick();
    soundFx.startTavernAmbience();
    const latestId = savedSessions.length > 0 ? savedSessions[0].id : null;
    const loaded = await loadGame(latestId);
    if (!loaded) {
      startNewGame();
    }
  };

  const handleLoadSpecificSave = async (sessionId) => {
    soundFx.playClick();
    soundFx.startTavernAmbience();
    await loadGame(sessionId);
    setShowSaveList(false);
  };

  const handleDeleteSave = async (e, sessionId) => {
    e.stopPropagation();
    soundFx.playClick();
    if (window.confirm('Are you sure you want to discard this chronicle? This cannot be undone.')) {
      await deleteSession(sessionId);
      await refreshSessions();
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
              onClick={handleContinueLatest}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-base shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Continue Adventure</span>
            </button>
          )}

          {savedSessions.length > 0 && (
            <button
              onClick={() => {
                soundFx.playClick();
                setShowSaveList(true);
              }}
              className="w-full py-2.5 px-6 rounded-xl bg-tavern-wood/80 hover:bg-tavern-umber text-tavern-gold border border-tavern-gold/40 font-cinzel text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-tavern-glow" />
              <span>Chronicles Library ({savedSessions.length})</span>
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

      {/* Saved Chronicles Modal */}
      {showSaveList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-tavern-darkest border-2 border-tavern-gold rounded-2xl shadow-2xl p-6 text-tavern-parchment space-y-4 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-tavern-gold/30 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-tavern-glow" />
                <h3 className="font-cinzel text-xl font-bold text-tavern-gold">Saved Chronicles</h3>
              </div>
              <button
                onClick={() => setShowSaveList(false)}
                className="p-1 rounded-lg hover:bg-tavern-wood text-tavern-gold/70 hover:text-tavern-gold transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Save Slots List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {savedSessions.length === 0 ? (
                <div className="text-center py-8 text-tavern-gold/60 text-sm font-cinzel">
                  No preserved chronicles found in the archives.
                </div>
              ) : (
                savedSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleLoadSpecificSave(session.id)}
                    className="p-3.5 rounded-xl bg-tavern-wood/50 hover:bg-tavern-wood border border-tavern-gold/30 hover:border-tavern-gold cursor-pointer transition-all duration-200 group flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel font-bold text-base text-tavern-glow group-hover:text-tavern-gold">
                          {session.characterName}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-tavern-amber/20 text-tavern-gold border border-tavern-gold/30">
                          Lvl {session.level} {session.characterClass}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-tavern-parchment/70">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-tavern-gold" />
                          {session.currentLocation}
                        </span>
                        <span>•</span>
                        <span>Turn {session.turnCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-tavern-gold/60">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(session.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteSave(e, session.id)}
                        className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 opacity-70 hover:opacity-100 transition"
                        title="Delete Save"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-tavern-gold/30 pt-3 text-right">
              <button
                onClick={() => setShowSaveList(false)}
                className="px-5 py-2 rounded-lg bg-tavern-wood border border-tavern-gold/40 text-tavern-gold font-cinzel text-xs hover:bg-tavern-amber hover:text-tavern-darkest font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
