"use client";

import React, { useState } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { SRD_MONSTERS } from "@/lib/srd/monsters";
import { BookOpen, X, Shield, Heart, Zap, Swords } from "lucide-react";

export default function BestiaryModal() {
  const { isBestiaryOpen, openBestiary, activeBestiaryMonsterKey } = useGameStore();

  const monsterKeys = Object.keys(SRD_MONSTERS);
  const [selectedKey, setSelectedKey] = useState<string>(activeBestiaryMonsterKey || monsterKeys[0]);

  if (!isBestiaryOpen) return null;

  const monster = SRD_MONSTERS[selectedKey] || SRD_MONSTERS.skeleton;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-obsidian-900 border-2 border-gold-500/50 rounded-3xl shadow-gold-glow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gold-500/20 bg-obsidian-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl font-bold text-gold-400 tracking-wider">
                5E SRD BESTIARY
              </h1>
              <p className="text-xs text-parchment-300/60 font-mono">
                Crypt Guardians & Undead Statblocks
              </p>
            </div>
          </div>
          <button
            onClick={() => openBestiary(false)}
            className="p-2 rounded-xl text-parchment-300 hover:text-gold-400 hover:bg-obsidian-850 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Layout: Left Master List, Right Statblock */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Monster Selector */}
          <div className="w-64 border-r border-gold-500/20 bg-obsidian-950/60 p-4 space-y-2 overflow-y-auto">
            {monsterKeys.map((key) => {
              const m = SRD_MONSTERS[key];
              const isSelected = selectedKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-gold-500/20 border-gold-500 text-gold-300 shadow-gold-glow"
                      : "bg-obsidian-900/50 border-gold-500/10 text-parchment-200 hover:bg-obsidian-850 hover:border-gold-500/30"
                  }`}
                >
                  <div className="font-cinzel font-bold text-xs">{m.name}</div>
                  <div className="text-[10px] text-parchment-300/60 mt-0.5">
                    CR {m.challengeRating} • {m.type}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Statblock Sheet */}
          <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-b from-parchment-100 to-parchment-200 text-obsidian-950 font-body">
            <div className="border-b-2 border-gold-700 pb-3 mb-4">
              <h2 className="font-cinzel text-2xl font-bold text-blood-700">{monster.name}</h2>
              <div className="italic text-xs text-parchment-900/80">
                {monster.size} {monster.type}, {monster.alignment}
              </div>
            </div>

            <div className="space-y-1 text-xs border-b border-parchment-400/80 pb-3 mb-4 font-mono">
              <div>
                <strong className="text-obsidian-950">Armor Class:</strong> {monster.armorClass} ({monster.armorType})
              </div>
              <div>
                <strong className="text-obsidian-950">Hit Points:</strong> {monster.hitPoints} ({monster.hitDice})
              </div>
              <div>
                <strong className="text-obsidian-950">Speed:</strong> {monster.speed} ft.
              </div>
            </div>

            {/* Ability Grid */}
            <div className="grid grid-cols-6 gap-2 py-3 border-b border-parchment-400/80 mb-4 text-center font-cinzel">
              <div>
                <div className="text-[10px] font-bold">STR</div>
                <div className="text-sm font-bold text-gold-800">{monster.abilities.str}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold">DEX</div>
                <div className="text-sm font-bold text-gold-800">{monster.abilities.dex}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold">CON</div>
                <div className="text-sm font-bold text-gold-800">{monster.abilities.con}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold">INT</div>
                <div className="text-sm font-bold text-gold-800">{monster.abilities.int}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold">WIS</div>
                <div className="text-sm font-bold text-gold-800">{monster.abilities.wis}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold">CHA</div>
                <div className="text-sm font-bold text-gold-800">{monster.abilities.cha}</div>
              </div>
            </div>

            {/* Senses and Challenge */}
            <div className="text-xs space-y-1 border-b border-parchment-400/80 pb-3 mb-4 font-mono">
              <div>
                <strong className="text-obsidian-950">Senses:</strong> {monster.senses}
              </div>
              <div>
                <strong className="text-obsidian-950">Languages:</strong> {monster.languages}
              </div>
              <div>
                <strong className="text-obsidian-950">Challenge:</strong> {monster.challengeRating} ({monster.experiencePoints} XP)
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="font-cinzel text-base font-bold text-blood-700 border-b border-parchment-400/80 pb-1 mb-3">
                ACTIONS
              </h3>
              <div className="space-y-3">
                {monster.actions.map((act, i) => (
                  <div key={i} className="text-xs leading-relaxed">
                    <span className="font-bold font-cinzel italic text-obsidian-950">{act.name}. </span>
                    <span className="text-parchment-900/90">{act.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}