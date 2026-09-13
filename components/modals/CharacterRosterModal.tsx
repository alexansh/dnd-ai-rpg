"use client";

import React from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import {
  Users,
  Sparkles,
  Play,
  Trash2,
  X,
  Shield,
  Heart,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function CharacterRosterModal() {
  const {
    isRosterModalOpen,
    openRosterModal,
    characterSaves,
    activeCharacterId,
    switchCharacter,
    openDeleteModal,
    openCreation,
    setCurrentScreen,
  } = useGameStore();

  if (!isRosterModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-obsidian-950 border-2 border-gold-500/50 rounded-3xl shadow-gold-glow-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Ornate Gold Banner */}
        <div className="h-2 bg-gradient-to-r from-gold-600 via-amber-400 to-gold-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gold-500/20 bg-obsidian-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 shadow-md">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-cinzel text-xl font-bold text-gold-400 tracking-wider">
                HERO ROSTER & CHRONICLE ARCHIVE
              </h2>
              <p className="text-xs text-parchment-300/60 font-mono">
                {characterSaves.length} Saved {characterSaves.length === 1 ? "Hero" : "Heroes"} Available
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                openRosterModal(false);
                openCreation(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-xs font-cinzel font-bold transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Forge New Hero</span>
            </button>

            <button
              onClick={() => openRosterModal(false)}
              className="p-1.5 rounded-xl text-parchment-400/60 hover:text-parchment-100 hover:bg-obsidian-850 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Roster Cards List */}
        <div className="p-8 overflow-y-auto space-y-4 flex-1">
          {characterSaves.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-obsidian-900 border border-gold-500/20 flex items-center justify-center mx-auto text-parchment-400/40">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-parchment-200">
                  No Active Heroes in the Tavern
                </h3>
                <p className="text-xs text-parchment-300/60 max-w-sm mx-auto mt-1">
                  All character chronicles have been incinerated. Visit the Hero Forge to carve out a new adventurer.
                </p>
              </div>
              <button
                onClick={() => {
                  openRosterModal(false);
                  openCreation(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 font-cinzel font-bold text-xs shadow-gold-glow transition-all"
              >
                Enter Hero Forge
              </button>
            </div>
          ) : (
            characterSaves.map((slot) => {
              const isActive = slot.id === activeCharacterId;
              const { player } = slot;
              const formattedDate = new Date(slot.lastPlayed).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isActive
                      ? "bg-obsidian-900/90 border-gold-500/60 shadow-gold-glow-sm"
                      : "bg-obsidian-900/50 border-gold-500/20 hover:border-gold-500/40 hover:bg-obsidian-900/70"
                  }`}
                >
                  {/* Left: Hero Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gold-500 shadow-md shrink-0">
                      <img
                        src={player.portrait}
                        alt={player.name}
                        className="w-full h-full object-cover filter contrast-105"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-obsidian-950/90 text-[9px] font-bold text-center text-gold-400 font-cinzel">
                        LVL {player.level}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-cinzel text-base font-bold text-parchment-100 truncate">
                          {player.name}
                        </h3>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-bold font-mono border border-gold-500/40">
                            <CheckCircle2 className="w-3 h-3 text-gold-400" /> ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gold-400/80 font-medium mt-0.5">
                        {player.race} {player.className}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-parchment-300/70 font-mono">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-blood-500" /> {player.currentHp}/{player.maxHp} HP
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-gold-400" /> AC {player.armorClass}
                        </span>
                        <span className="flex items-center gap-1 text-parchment-400">
                          <MapPin className="w-3 h-3 text-amber-500" /> Act {slot.currentAct}: {slot.currentLocation}
                        </span>
                        <span className="flex items-center gap-1 text-parchment-400/50">
                          <Clock className="w-3 h-3" /> {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isActive ? (
                      <button
                        onClick={() => {
                          switchCharacter(slot.id);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-obsidian-850 hover:bg-gold-600 hover:text-obsidian-950 text-gold-300 border border-gold-500/30 text-xs font-cinzel font-bold transition-all shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Select</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          openRosterModal(false);
                          setCurrentScreen("game");
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 text-xs font-cinzel font-bold transition-all shadow-gold-glow"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Embark</span>
                      </button>
                    )}

                    <button
                      onClick={() => openDeleteModal(true, slot.id)}
                      className="p-2 rounded-xl bg-obsidian-850 hover:bg-blood-950/80 text-parchment-400/60 hover:text-blood-400 border border-gold-500/20 hover:border-blood-500/40 transition-all"
                      title={`Incinerate ${player.name}'s chronicle`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
