"use client";

import React, { useState, useEffect } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { getSoundscapeEngine, AmbianceType } from "@/lib/audio/soundscapeEngine";
import { Volume2, VolumeX, Music, Sliders } from "lucide-react";

export default function SoundscapePlayer() {
  const { ambiance } = useGameStore();
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  useEffect(() => {
    const engine = getSoundscapeEngine();
    engine.setAmbiance(ambiance as AmbianceType);
  }, [ambiance]);

  const toggleMute = () => {
    const engine = getSoundscapeEngine();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    engine.setMuted(nextMuted);
    if (!nextMuted) {
      engine.setAmbiance(ambiance as AmbianceType);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    const engine = getSoundscapeEngine();
    engine.setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
      engine.setMuted(false);
    }
  };

  const getAmbianceLabel = () => {
    switch (ambiance) {
      case "battle_tense":
        return "Battle Drums • The Crypt Awakens";
      case "crypt_solemn":
        return "Damp Stone & Whispers • Solemn Crypt";
      case "dungeon_creepy":
        return "Dripping Water • The Flooded Vaults";
      case "tavern_warm":
      default:
        return "Firelight & Hearth • Wayward Flagon";
    }
  };

  return (
    <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-950/80 border border-gold-500/20 text-xs backdrop-blur-md shadow-inner">
      {/* Mute/Unmute Toggle */}
      <button
        onClick={toggleMute}
        className="p-1 rounded-lg text-gold-400 hover:text-gold-300 transition-colors focus:outline-none"
        title={isMuted ? "Unmute Procedural Soundscape" : "Mute Soundscape"}
        aria-label={isMuted ? "Unmute Soundscape" : "Mute Soundscape"}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-parchment-300/40" />
        ) : (
          <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
        )}
      </button>

      {/* Label and Equalizer Animation */}
      <div className="flex items-center gap-1.5 font-mono text-[10px] text-parchment-300/70">
        <Music className={`w-3 h-3 ${isMuted ? "text-gold-500/40" : "text-amber-400"}`} />
        <span className="hidden sm:inline-block max-w-[180px] truncate">{getAmbianceLabel()}</span>
        {!isMuted && (
          <div className="flex items-end gap-0.5 h-3 ml-1" title="Procedural Audio Synthesizing">
            <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-0.5 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-0.5 h-1.5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {/* Volume Slider Popover Toggle */}
      <button
        onClick={() => setShowVolumeControl(!showVolumeControl)}
        className="p-0.5 text-parchment-300/50 hover:text-gold-400 transition-colors"
        title="Soundscape Volume Settings"
      >
        <Sliders className="w-3 h-3" />
      </button>

      {/* Volume Slider Popover */}
      {showVolumeControl && (
        <div className="absolute right-0 top-full mt-2 w-36 p-2 rounded-lg bg-obsidian-900 border border-gold-500/30 shadow-xl flex flex-col gap-1 z-50 animate-fadeIn">
          <div className="flex justify-between text-[10px] text-parchment-300/80 font-mono">
            <span>Volume</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-obsidian-950 rounded-lg appearance-none"
          />
        </div>
      )}
    </div>
  );
}