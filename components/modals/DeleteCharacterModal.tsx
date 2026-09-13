"use client";

import React from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { Flame, Trash2, X, AlertTriangle, Shield, Heart, MapPin } from "lucide-react";

export default function DeleteCharacterModal() {
  const {
    isDeleteModalOpen,
    openDeleteModal,
    characterToDeleteId,
    characterSaves,
    player,
    activeCharacterId,
    currentAct,
    currentLocation,
    logs,
    deleteCharacterAndCampaign,
  } = useGameStore();

  if (!isDeleteModalOpen) return null;

  // Find target character
  const targetSlot = characterSaves.find((c) => c.id === characterToDeleteId);
  const targetPlayer = targetSlot?.player || (characterToDeleteId === activeCharacterId ? player : null) || player;

  if (!targetPlayer) return null;

  const targetId = targetSlot?.id || characterToDeleteId || activeCharacterId;
  const targetAct = targetSlot?.currentAct ?? currentAct;
  const targetLoc = targetSlot?.currentLocation ?? currentLocation;
  const targetLogsCount = targetSlot?.logs?.length ?? logs.length;

  const handleDelete = () => {
    if (targetId) {
      deleteCharacterAndCampaign(targetId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-obsidian-950 border-2 border-blood-600/70 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.35)] overflow-hidden flex flex-col">
        {/* Burning Ember Banner */}
        <div className="h-2 bg-gradient-to-r from-blood-700 via-amber-500 to-blood-700" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blood-900/40 bg-obsidian-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blood-950/80 border border-blood-500/40 text-blood-400 shadow-md">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-blood-400 tracking-wider">
                INCINERATE CHRONICLE
              </h2>
              <p className="text-xs text-parchment-300/60 font-mono">
                The Rite of Ash • Irreversible Deletion
              </p>
            </div>
          </div>

          <button
            onClick={() => openDeleteModal(false)}
            className="p-1.5 rounded-xl text-parchment-400/60 hover:text-parchment-100 hover:bg-obsidian-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Character Preview Card */}
          <div className="p-4 rounded-2xl bg-obsidian-900 border border-gold-500/20 flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-blood-600 shadow-md shrink-0">
              <img
                src={targetPlayer.portrait}
                alt={targetPlayer.name}
                className="w-full h-full object-cover filter contrast-110"
              />
              <div className="absolute inset-0 bg-blood-900/20 mix-blend-color-burn" />
              <div className="absolute bottom-0 inset-x-0 bg-obsidian-950/90 text-[9px] font-bold text-center text-gold-400 font-cinzel">
                LVL {targetPlayer.level}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-sm font-bold text-parchment-100 truncate">
                  {targetPlayer.name}
                </h3>
                <span className="text-[10px] text-amber-500 font-mono font-semibold">
                  ACT {targetAct}
                </span>
              </div>
              <div className="text-xs text-gold-400/80 font-medium">
                {targetPlayer.race} {targetPlayer.className}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-parchment-300/70 font-mono">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-blood-500" /> {targetPlayer.currentHp}/{targetPlayer.maxHp} HP
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-gold-400" /> AC {targetPlayer.armorClass}
                </span>
                <span className="flex items-center gap-1 truncate text-parchment-400">
                  <MapPin className="w-3 h-3 text-amber-500" /> {targetLoc}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Callout Box */}
          <div className="p-4 rounded-2xl bg-blood-950/40 border border-blood-600/40 text-blood-200/90 space-y-2">
            <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-blood-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-blood-500" />
              <span>Permanent Deletion Warning</span>
            </div>
            <p className="text-xs leading-relaxed font-sans text-parchment-300/80">
              This action will permanently burn the character scroll for{" "}
              <strong className="text-gold-300 font-medium">{targetPlayer.name}</strong>, their equipped armory,
              and all <strong className="text-amber-400 font-medium">{targetLogsCount} chronicle entries</strong> recorded
              in the Sunken Crypt. This campaign save cannot be recovered.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-blood-900/40 bg-obsidian-900/50 flex items-center justify-end gap-3">
          <button
            onClick={() => openDeleteModal(false)}
            className="px-4 py-2.5 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 text-parchment-300 hover:text-parchment-100 text-xs font-cinzel font-bold border border-gold-500/20 transition-all shadow-sm"
          >
            Preserve Chronicle
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blood-700 via-blood-600 to-blood-800 hover:from-blood-600 hover:to-blood-700 text-parchment-100 text-xs font-cinzel font-bold border border-blood-500 shadow-md transition-all hover:scale-[1.02] active:scale-98"
          >
            <Trash2 className="w-4 h-4 text-blood-300" />
            <span>Incinerate & Delete Forever</span>
          </button>
        </div>
      </div>
    </div>
  );
}
