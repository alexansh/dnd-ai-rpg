"use client";

import React from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { SRD_SPELLS } from "@/lib/srd/spells";
import { Sparkles, X, Wand2, Shield, Heart } from "lucide-react";

export default function SpellbookDrawer() {
  const { isSpellbookOpen, openSpellbook, player, combat, executePlayerCastSpell } = useGameStore();

  if (!isSpellbookOpen || !player) return null;

  const spells = Object.values(SRD_SPELLS);

  const handleCast = (spellId: string) => {
    executePlayerCastSpell(spellId);
    openSpellbook(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border-2 border-gold-500/50 rounded-2xl shadow-gold-glow-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold-500/30 bg-obsidian-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-arcane-500/20 text-arcane-400 border border-arcane-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-gold-400 tracking-wider">
                GRIMOIRE & SPELLBOOK
              </h2>
              <p className="text-xs text-parchment-300/60">
                1st-Level Spell Slots: {player.spellSlotsLevel1} / {player.maxSpellSlotsLevel1 || 2}
              </p>
            </div>
          </div>
          <button
            onClick={() => openSpellbook(false)}
            className="p-1.5 rounded-lg text-parchment-300 hover:text-gold-400 hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spells Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spells.map((spell) => {
              const isCantrip = spell.level === 0;
              return (
                <div
                  key={spell.id}
                  className="p-4 rounded-xl bg-obsidian-950/80 border border-gold-500/20 hover:border-gold-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-cinzel font-bold text-sm text-gold-300">{spell.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-arcane-500/20 text-arcane-300 border border-arcane-500/30 font-semibold uppercase">
                        {isCantrip ? "Cantrip" : `Level ${spell.level}`}
                      </span>
                    </div>
                    <div className="text-[11px] text-parchment-300/50 mb-2 font-mono">
                      {spell.school} • {spell.range} • {spell.castingTime}
                    </div>
                    <p className="text-xs text-parchment-200/80 line-clamp-3 mb-3">
                      {spell.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCast(spell.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-arcane-600 to-arcane-500 hover:from-arcane-500 hover:to-arcane-400 text-white text-xs font-bold font-cinzel shadow-md transition-all"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Cast Spell</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}