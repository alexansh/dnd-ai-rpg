"use client";

import React, { useState } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { Volume2, VolumeX, Music } from "lucide-react";

export default function SoundscapePlayer() {
  const { ambiance } = useGameStore();
  const [isMuted, setIsMuted] = useState(true);

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
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-950/80 border border-gold-500/20 text-xs backdrop-blur-md">
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="p-1 rounded-lg text-gold-400 hover:text-gold-300 transition-colors"
        title={isMuted ? "Unmute Soundscape" : "Mute Soundscape"}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-parchment-300/40" /> : <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />}
      </button>

      <div className="flex items-center gap-1.5 font-mono text-[10px] text-parchment-300/70">
        <Music className="w-3 h-3 text-gold-500/80" />
        <span>{getAmbianceLabel()}</span>
      </div>
    </div>
  );
}