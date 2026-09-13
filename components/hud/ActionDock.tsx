"use client";

import React, { useState } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import QuickSlotBar from "@/components/inventory/QuickSlotBar";
import {
  Swords,
  Sparkles,
  Footprints,
  Shield,
  Send,
  CheckCircle2,
  MessageSquare,
  BookOpen,
} from "lucide-react";

export default function ActionDock() {
  const {
    player,
    combat,
    isCombatActive,
    suggestedActions,
    submitPlayerAction,
    openSpellbook,
    endCurrentCombatTurn,
    executePlayerCombatAttack,
  } = useGameStore();

  const [inputVal, setInputVal] = useState("");
  const [inputMode, setInputMode] = useState<"do" | "say" | "story">("do");

  if (!player) return null;

  const activeCombatant = combat?.combatants[combat.activeTurnIndex];
  const isPlayerTurn = isCombatActive && activeCombatant?.isPlayer;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    submitPlayerAction(inputVal.trim(), inputMode);
    setInputVal("");
  };

  const getPlaceholder = () => {
    switch (inputMode) {
      case "say":
        return `What does ${player.name} say aloud? (e.g. 'Sister Beatrice, bless our advance', 'Who goes there?')...`;
      case "story":
        return "Direct the chronicle / steer the narrative (e.g. 'A bone-chilling draft sweeps through the crypt')...";
      default:
        return "What do you attempt to do? (e.g. 'Force the crypt door open', 'Search the sarcophagus for traps')...";
    }
  };

  return (
    <div className="w-full bg-obsidian-900 border-t border-gold-500/20 px-6 py-3.5 backdrop-blur-lg flex flex-col gap-3 z-30">
      {/* Top Action Bar Buttons & Quick Slots */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Attack Action */}
          <button
            onClick={() => {
              if (isPlayerTurn) {
                // Target nearest alive enemy
                const target = combat?.combatants.find((c) => c.isEnemy && c.currentHp > 0);
                if (target) executePlayerCombatAttack(target.id);
              } else {
                submitPlayerAction(`Draw ${player.equippedWeapon} and strike!`, "do");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 text-white font-cinzel font-bold text-xs shadow-blood-glow border border-blood-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <Swords className="w-4 h-4 text-amber-300" />
            <span>Attack ({player.equippedWeapon ? player.equippedWeapon.toUpperCase() : "MELEE"})</span>
          </button>

          {/* Spellbook Trigger */}
          <button
            onClick={() => openSpellbook(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-arcane-600 to-arcane-500 hover:from-arcane-500 hover:to-arcane-400 text-white font-cinzel font-bold text-xs shadow-md border border-arcane-400/40 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Spellbook</span>
          </button>

          {/* Dash */}
          <button
            onClick={() => submitPlayerAction("Take the Dash action to double movement speed.", "do")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-parchment-200 text-xs font-semibold border border-gold-500/20 transition-all"
          >
            <Footprints className="w-3.5 h-3.5 text-gold-400" />
            <span>Dash</span>
          </button>

          {/* Dodge */}
          <button
            onClick={() => submitPlayerAction("Take the Dodge action, imposing disadvantage on incoming attacks.", "do")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-parchment-200 text-xs font-semibold border border-gold-500/20 transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-gold-400" />
            <span>Dodge</span>
          </button>

          {/* 1-Click Consumables Quick Slot Bar */}
          <QuickSlotBar />
        </div>

        {/* End Turn Button when in combat */}
        {isCombatActive && (
          <button
            onClick={endCurrentCombatTurn}
            disabled={!isPlayerTurn}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-cinzel font-bold text-xs transition-all shadow-md ${
              isPlayerTurn
                ? "bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 hover:from-gold-500 hover:to-gold-400 shadow-gold-glow animate-pulse"
                : "bg-obsidian-800 text-parchment-300/40 border border-gold-500/20 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isPlayerTurn ? "END YOUR TURN" : `${activeCombatant?.name ?? "Enemy"}'s Turn...`}</span>
          </button>
        )}
      </div>

      {/* Suggested Action Chips */}
      {suggestedActions && suggestedActions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-gold-400/80 font-cinzel uppercase tracking-wider">
            Quick Actions:
          </span>
          {suggestedActions.map((action, i) => (
            <button
              key={i}
              onClick={() => submitPlayerAction(action, "do")}
              className="px-3 py-1 rounded-full bg-obsidian-950/80 border border-gold-500/30 hover:border-gold-400 hover:bg-obsidian-850 hover:text-gold-300 text-parchment-300 text-xs transition-all shadow-sm"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Segmented Story / Do / Say Dock & Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Segmented Pill Selector: Do | Say | Story */}
        <div className="flex items-center self-start sm:self-auto rounded-xl bg-obsidian-950 p-1 border border-gold-500/30 shadow-inner">
          <button
            type="button"
            onClick={() => setInputMode("do")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all ${
              inputMode === "do"
                ? "bg-blood-700 text-white shadow-sm border border-blood-500/40"
                : "text-parchment-300 hover:text-gold-400"
            }`}
            title="Perform a physical or tactical action requiring resolution"
          >
            <Swords className="w-3.5 h-3.5 text-amber-300" />
            <span>Do</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode("say")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all ${
              inputMode === "say"
                ? "bg-amber-600 text-white shadow-sm border border-amber-400/40"
                : "text-parchment-300 hover:text-gold-400"
            }`}
            title="Speak aloud in character to companions or NPCs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-parchment-100" />
            <span>Say</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode("story")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all ${
              inputMode === "story"
                ? "bg-purple-700 text-white shadow-sm border border-purple-500/40"
                : "text-parchment-300 hover:text-gold-400"
            }`}
            title="Narrative steering / out-of-character story directives"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-200" />
            <span>Story</span>
          </button>
        </div>

        {/* Free-form Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full px-4 py-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-parchment-100 placeholder-parchment-300/40 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/50 shadow-inner font-body transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 font-bold font-cinzel text-xs shadow-gold-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}