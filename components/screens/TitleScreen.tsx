"use client";

import React from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import SoundscapePlayer from "@/components/audio/SoundscapePlayer";
import {
  Flame,
  Compass,
  Sparkles,
  Scroll,
  BookOpen,
  User,
  Shield,
  Heart,
  ChevronRight,
  RotateCcw,
  Trash2,
  Users,
} from "lucide-react";

export default function TitleScreen() {
  const {
    player,
    currentLocation,
    currentAct,
    characterSaves,
    activeCharacterId,
    setCurrentScreen,
    openCreation,
    openCampaignSelect,
    openBestiary,
    openDeleteModal,
    openRosterModal,
    resetGame,
  } = useGameStore();

  const handleStartGame = () => {
    if (!player) {
      openCreation(true);
      return;
    }
    setCurrentScreen("game");
  };

  return (
    <div className="relative h-screen w-screen flex flex-col justify-between bg-obsidian-950 text-parchment-100 overflow-hidden select-none">
      {/* Background Tavern Scene with Dark Radial Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/images/scenery/tavern.jpg"
          alt="The Wayward Flagon Taproom"
          className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-125 scale-105 transition-transform duration-10000 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/70 to-obsidian-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#07080a_90%)]" />
      </div>

      {/* Top Bar Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2 text-gold-400">
          <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-mono text-parchment-300/60">
            D&D 5E AI TAVERN RPG
          </span>
        </div>

        <div className="flex items-center gap-3">
          <SoundscapePlayer />
          <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-obsidian-900/80 border border-gold-500/30 text-gold-400">
            v2.0 • Deterministic Core
          </span>
        </div>
      </header>

      {/* Center Cinematic Content */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto px-6 text-center space-y-6">
        {/* Crest */}
        <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-gold-500/20 to-blood-600/20 border-2 border-gold-500/40 shadow-gold-glow">
          <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        {/* Title and Subtitle */}
        <div>
          <h1 className="font-cinzel text-4xl md:text-5xl font-extrabold tracking-wider bg-gradient-to-r from-gold-400 via-gold-300 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
            THE WAYWARD FLAGON
          </h1>
          <p className="font-cinzel text-xs md:text-sm text-parchment-300/80 mt-2 tracking-widest uppercase">
            Interactive 5e Virtual Tabletop & AI Dungeon Master
          </p>
        </div>

        {/* Active Hero Preview Card or Empty State */}
        {player ? (
          <div className="relative w-full max-w-md p-4 rounded-2xl bg-obsidian-900/90 border border-gold-500/40 shadow-2xl backdrop-blur-md flex items-center gap-4 text-left group">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gold-500 shadow-md shrink-0">
              <img src={player.portrait} alt={player.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-obsidian-950/90 text-[9px] font-bold text-center text-gold-400 font-cinzel">
                LVL {player.level}
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-16">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-sm font-bold text-parchment-100 truncate">
                  {player.name}
                </h3>
              </div>
              <div className="text-xs text-gold-400/80 font-medium">
                {player.race} {player.className}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-parchment-300/70 font-mono">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-blood-500" /> {player.currentHp}/{player.maxHp} HP
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-gold-400" /> AC {player.armorClass}
                </span>
                <span className="text-parchment-400 truncate">
                  • Act {currentAct}
                </span>
              </div>
            </div>

            {/* Micro Action Buttons on Card */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <button
                onClick={() => openRosterModal(true)}
                className="p-1.5 rounded-lg bg-obsidian-850 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 transition-colors"
                title="Open Hero Roster"
              >
                <Users className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => openDeleteModal(true, activeCharacterId || undefined)}
                className="p-1.5 rounded-lg bg-obsidian-850 hover:bg-blood-950/80 text-parchment-400 hover:text-blood-400 border border-gold-500/20 hover:border-blood-500/40 transition-colors"
                title="Delete Character & Campaign"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md p-6 rounded-2xl bg-obsidian-900/90 border border-gold-500/30 shadow-2xl backdrop-blur-md flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-obsidian-950 border border-gold-500/20 flex items-center justify-center text-amber-500">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-cinzel text-sm font-bold text-parchment-200 uppercase tracking-wider">
                The Taproom Awaits a Hero
              </h3>
              <p className="text-xs text-parchment-300/60 mt-1">
                All chronicles have been incinerated. Forge a new hero to embark.
              </p>
            </div>
            <button
              onClick={() => openCreation(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 font-cinzel font-bold text-xs shadow-gold-glow transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Forge New Hero</span>
            </button>
          </div>
        )}

        {/* Main Menu Action Buttons */}
        <div className="w-full max-w-md flex flex-col gap-3">
          {/* Primary Continue / Embark Button */}
          <button
            onClick={handleStartGame}
            className="group w-full flex items-center justify-between px-6 py-3.5 rounded-2xl bg-gradient-to-r from-gold-600 via-gold-500 to-amber-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 font-cinzel font-bold text-sm shadow-gold-glow transition-all hover:scale-[1.02] active:scale-98"
          >
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-obsidian-950" />
              <span>{player ? "Resume Adventure" : "Forge Hero & Begin"}</span>
            </div>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          {/* New Adventure / Hero Forge & Chronicles */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openCreation(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-obsidian-900/80 hover:bg-obsidian-850 text-gold-300 border border-gold-500/30 hover:border-gold-400 text-xs font-cinzel font-bold transition-all shadow-md backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Hero Forge</span>
            </button>

            <button
              onClick={() => openCampaignSelect(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-obsidian-900/80 hover:bg-obsidian-850 text-gold-300 border border-gold-500/30 hover:border-gold-400 text-xs font-cinzel font-bold transition-all shadow-md backdrop-blur-md"
            >
              <Scroll className="w-4 h-4 text-amber-400" />
              <span>Chronicles</span>
            </button>
          </div>

          {/* Secondary Actions Row: Hero Roster & Bestiary */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => openRosterModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian-950/70 hover:bg-obsidian-900 text-gold-400 border border-gold-500/20 hover:border-gold-500/40 text-xs font-cinzel transition-all"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Hero Roster ({characterSaves.length})</span>
            </button>

            <button
              onClick={() => openBestiary(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian-950/70 hover:bg-obsidian-900 text-parchment-300 border border-gold-500/20 hover:border-gold-500/40 text-xs font-cinzel transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-gold-500" />
              <span>SRD Bestiary</span>
            </button>
          </div>

          {/* Danger Row: Delete Character & Campaign */}
          {player && (
            <button
              onClick={() => openDeleteModal(true, activeCharacterId || undefined)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-obsidian-950/40 hover:bg-blood-950/50 text-parchment-400 hover:text-blood-400 border border-blood-500/20 hover:border-blood-500/40 text-xs font-cinzel transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-blood-500" />
              <span>Delete Character & Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="relative z-10 px-8 py-4 flex items-center justify-between text-[11px] text-parchment-300/40 font-mono border-t border-gold-500/10 bg-obsidian-950/50 backdrop-blur-sm">
        <div>Dungeons & Dragons 5e SRD Reference Engine</div>
        <div>Turn-Based 2D Grid Skirmishes • Multi-Agent AI DM</div>
      </footer>
    </div>
  );
}