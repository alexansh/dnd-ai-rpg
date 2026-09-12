"use client";

import React from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { Shield, Heart, Zap, Sparkles, BookOpen, User, Flame } from "lucide-react";

export default function PartyVitals() {
  const { player, companions, openCharacterSheet, openBestiary, isCombatActive } = useGameStore();

  const hpPct = Math.max(0, Math.min(1, player.currentHp / player.maxHp));

  return (
    <aside className="w-80 h-full bg-obsidian-900 border-r border-gold-500/20 flex flex-col justify-between overflow-y-auto p-4 z-20 backdrop-blur-md">
      <div className="space-y-4">
        {/* Header Branding */}
        <div className="flex items-center justify-between pb-3 border-b border-gold-500/20">
          <div>
            <h1 className="font-cinzel text-base font-bold text-gold-400 tracking-wider">
              PARTY VITALS
            </h1>
            <p className="text-[10px] text-parchment-300/60 uppercase tracking-widest font-mono">
              The Sunken Crypt Campaign
            </p>
          </div>
          <button
            onClick={() => openCharacterSheet(true)}
            className="p-2 rounded-xl bg-obsidian-950 border border-gold-500/30 hover:border-gold-400 text-gold-400 hover:shadow-gold-glow transition-all"
            title="Inspect Character Sheet"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* Player Character Card */}
        <div className="relative p-4 rounded-2xl bg-gradient-to-b from-obsidian-850 to-obsidian-950 border-2 border-gold-500/40 shadow-xl overflow-hidden group">
          {/* Subtle rim glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 mb-3">
            {/* Portrait */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-gold-500 shadow-md">
              <img
                src={player.portrait}
                alt={player.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-obsidian-950/80 text-[9px] font-bold text-center text-gold-400 font-cinzel">
                LVL {player.level}
              </div>
            </div>

            {/* Name & Class */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-sm font-bold text-parchment-100 tracking-wide">
                  {player.name}
                </h3>
                {player.inspiration && (
                  <span
                    className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40"
                    title="Inspiration Available (Reroll d20)"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    Insp
                  </span>
                )}
              </div>
              <div className="text-xs text-gold-400/80 font-medium">
                {player.race} {player.className}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-parchment-300/70">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-gold-400" /> AC {player.armorClass}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Init +{player.initiativeModifier}
                </span>
              </div>
            </div>
          </div>

          {/* HP Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1 text-parchment-300/80 font-semibold text-[11px]">
                <Heart className="w-3 h-3 text-blood-500" /> Hit Points
              </span>
              <span className="font-mono text-xs font-bold text-parchment-100">
                {player.currentHp} / {player.maxHp} HP
                {player.tempHp > 0 && ` (+${player.tempHp})`}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-obsidian-950 border border-gold-500/30 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  hpPct > 0.5
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                    : hpPct > 0.25
                    ? "bg-gradient-to-r from-amber-600 to-amber-400"
                    : "bg-gradient-to-r from-blood-700 to-blood-500 animate-pulse"
                }`}
                style={{ width: `${hpPct * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Companions Sub-list */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-gold-400/80 font-cinzel uppercase tracking-wider">
              Companions & Party
            </span>
            <span className="text-[10px] text-parchment-300/50 font-mono">3 Recruited</span>
          </div>

          {Object.values(companions).map((comp) => (
            <div
              key={comp.id}
              className="p-3 rounded-xl bg-obsidian-950/70 border border-gold-500/20 hover:border-gold-500/40 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gold-500/40">
                  <img src={comp.portrait} alt={comp.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-cinzel text-xs font-bold text-parchment-100">{comp.name}</div>
                  <div className="text-[10px] text-gold-400/80">{comp.className} • {comp.role}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-parchment-300/60 font-mono">Approval</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">+{comp.approval}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bestiary Drawer Trigger */}
      <div className="pt-3 border-t border-gold-500/20 mt-4">
        <button
          onClick={() => openBestiary(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 hover:border-gold-400 text-gold-400 font-cinzel font-bold text-xs shadow-md transition-all hover:bg-obsidian-850"
        >
          <BookOpen className="w-4 h-4" />
          <span>SRD Monster Bestiary</span>
        </button>
      </div>
    </aside>
  );
}