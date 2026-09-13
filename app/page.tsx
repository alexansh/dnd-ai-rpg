"use client";

import React, { useEffect, useState } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import TitleScreen from "@/components/screens/TitleScreen";
import CampaignSelectModal from "@/components/screens/CampaignSelectModal";
import PartyVitals from "@/components/hud/PartyVitals";
import CenterViewport from "@/components/hud/CenterViewport";
import DMTerminal from "@/components/hud/DMTerminal";
import ActionDock from "@/components/hud/ActionDock";
import DiceTray from "@/components/hud/DiceTray";
import CharacterSheetModal from "@/components/modals/CharacterSheetModal";
import BestiaryModal from "@/components/modals/BestiaryModal";
import CreationModal from "@/components/modals/CreationModal";
import SpellbookDrawer from "@/components/hud/SpellbookDrawer";
import SoundscapePlayer from "@/components/audio/SoundscapePlayer";
import DeleteCharacterModal from "@/components/modals/DeleteCharacterModal";
import CharacterRosterModal from "@/components/modals/CharacterRosterModal";
import { Flame, Sparkles, RotateCcw, DoorOpen, Scroll, Users, Trash2 } from "lucide-react";

export default function GamePage() {
  const {
    currentScreen,
    setCurrentScreen,
    openCreation,
    openCampaignSelect,
    openRosterModal,
    openDeleteModal,
    resetGame,
  } = useGameStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-screen w-screen bg-obsidian-950 flex items-center justify-center text-gold-400 font-cinzel text-lg">
        <div className="flex flex-col items-center gap-3">
          <Flame className="w-8 h-8 animate-pulse text-amber-500" />
          <span>Entering the Wayward Flagon...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen flex flex-col bg-obsidian-950 text-parchment-100 overflow-hidden select-none">
      {/* View Router */}
      {currentScreen === "title" ? (
        <TitleScreen />
      ) : (
        <div className="h-full w-full flex flex-col overflow-hidden">
          {/* Universal Top Bar */}
          <header className="h-12 bg-obsidian-950 border-b border-gold-500/30 px-6 flex items-center justify-between z-40 shadow-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen("title")}
                className="flex items-center gap-2 px-3 py-1 rounded-xl bg-obsidian-900 border border-gold-500/30 hover:border-gold-400 text-gold-400 text-xs font-cinzel font-bold shadow-sm transition-all hover:bg-obsidian-850"
                title="Return to Main Title Screen"
              >
                <DoorOpen className="w-4 h-4 text-amber-400" />
                <span>Main Menu</span>
              </button>

              <div className="flex items-center gap-2 text-gold-400 pl-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="font-cinzel text-sm font-extrabold tracking-wider bg-gradient-to-r from-gold-400 via-gold-300 to-amber-500 bg-clip-text text-transparent">
                  THE WAYWARD FLAGON
                </span>
              </div>
            </div>

            {/* Top Controls */}
            <div className="flex items-center gap-3">
              <SoundscapePlayer />

              <button
                onClick={() => openCampaignSelect(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-gold-500/30 hover:border-gold-400 text-gold-400 text-xs font-cinzel font-bold shadow-sm transition-all"
              >
                <Scroll className="w-3.5 h-3.5" />
                <span>Chronicles</span>
              </button>

              <button
                onClick={() => openRosterModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-gold-500/30 hover:border-gold-400 text-gold-400 text-xs font-cinzel font-bold shadow-sm transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Roster</span>
              </button>

              <button
                onClick={() => openCreation(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-gold-500/30 hover:border-gold-400 text-gold-400 text-xs font-cinzel font-bold shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hero Forge</span>
              </button>

              <button
                onClick={() => openDeleteModal(true)}
                className="p-1.5 rounded-xl text-parchment-300/50 hover:text-blood-400 hover:bg-obsidian-900 transition-colors"
                title="Delete Character & Campaign"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main 3-Column Tactical HUD */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Party Vitals Sidebar */}
            <PartyVitals />

            {/* Center: Theater of Mind / 2D Tactical Grid */}
            <CenterViewport />

            {/* Right: DM Terminal & Narrative Log */}
            <DMTerminal />
          </div>

          {/* Bottom Interactive Command Dock */}
          <ActionDock />
        </div>
      )}

      {/* Overlays & Modals (Accessible from both Title Screen and In-Game) */}
      <DiceTray />
      <CharacterSheetModal />
      <BestiaryModal />
      <CreationModal />
      <SpellbookDrawer />
      <CampaignSelectModal />
      <DeleteCharacterModal />
      <CharacterRosterModal />
    </main>
  );
}