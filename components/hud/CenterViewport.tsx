"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useGameStore } from "@/lib/state/useGameStore";
import TacticalGrid from "./TacticalGrid";
import { Compass, Swords, Shield, Eye, Flame } from "lucide-react";

export default function CenterViewport() {
  const {
    currentLocation,
    currentAct,
    pointsOfInterest,
    isCombatActive,
    submitPlayerAction,
    startCombatEncounter,
  } = useGameStore();

  const [viewMode, setViewMode] = useState<"theater" | "grid">(isCombatActive ? "grid" : "theater");

  // Keep grid view active if combat started
  const activeMode = isCombatActive ? "grid" : viewMode;

  const getSceneImage = () => {
    if (currentAct === 1) return "/assets/images/scenery/crypt.jpg";
    if (currentAct === 2) return "/assets/images/scenery/dungeon.jpg";
    if (currentAct === 3) return "/assets/images/scenery/dungeon.jpg";
    return "/assets/images/scenery/crypt.jpg";
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-obsidian-950 border-x border-gold-500/20 overflow-hidden">
      {/* Viewport Top Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-obsidian-900/90 border-b border-gold-500/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
                ACT {currentAct}
              </span>
              <h2 className="font-cinzel text-base font-bold text-parchment-100 tracking-wide">
                {currentLocation}
              </h2>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-obsidian-950 border border-gold-500/30">
          <button
            onClick={() => setViewMode("theater")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeMode === "theater"
                ? "bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-gold-glow"
                : "text-parchment-300/60 hover:text-parchment-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Theater of Mind</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeMode === "grid"
                ? "bg-blood-700/40 text-red-300 border border-blood-500/50 shadow-blood-glow"
                : "text-parchment-300/60 hover:text-parchment-200"
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Tactical Grid {isCombatActive && "(COMBAT)"}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        {activeMode === "grid" ? (
          <div className="w-full h-full flex items-center justify-center">
            <TacticalGrid />
          </div>
        ) : (
          <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gold-500/20 shadow-2xl group">
            {/* Background scene */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-radial-vignette opacity-80 pointer-events-none z-10" />
            <img
              src={getSceneImage()}
              alt={currentLocation}
              className="w-full h-full object-cover object-center filter brightness-90 contrast-105 transition-transform duration-1000 group-hover:scale-105"
            />

            {/* Ambient Ember Glow */}
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-950/70 border border-gold-500/30 text-gold-400 text-xs z-20 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              <span>Ambient Gloom</span>
            </div>

            {/* Interactive POIs floating above scene */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-3 z-20">
              {pointsOfInterest.map((poi) => (
                <button
                  key={poi.id}
                  onClick={() => submitPlayerAction(poi.interactAction)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-obsidian-950/85 border border-gold-500/40 text-parchment-100 text-xs shadow-xl backdrop-blur-md hover:border-gold-400 hover:shadow-gold-glow hover:bg-obsidian-900 transition-all group/btn"
                >
                  <div className="p-1 rounded bg-gold-500/20 text-gold-400 group-hover/btn:scale-110 transition-transform">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gold-300 font-cinzel">{poi.name}</div>
                    <div className="text-[10px] text-parchment-300/70">{poi.interactAction}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}