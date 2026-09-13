"use client";

import React from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { SRD_ITEMS } from "@/lib/srd/items";
import { calculateAbilityModifier } from "@/lib/engine/rules";
import { Shield, Heart, Zap, X, Bed, Moon, Swords, Sparkles, Trash2 } from "lucide-react";

export default function CharacterSheetModal() {
  const { isCharacterSheetOpen, openCharacterSheet, player, restShort, restLong, setPlayer, openDeleteModal } = useGameStore();

  if (!isCharacterSheetOpen || !player) return null;

  const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"] as const;

  const handleEquipWeapon = (itemId: string) => {
    setPlayer({ equippedWeapon: itemId });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-parchment-100 to-parchment-200 text-obsidian-950 rounded-3xl border-4 border-gold-600 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Ornate Gold Border Bar */}
        <div className="h-2 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-parchment-400/60 bg-parchment-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gold-600 shadow-md">
              <img src={player.portrait} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-2xl font-bold tracking-wide text-obsidian-950">
                  {player.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-700 font-bold font-cinzel border border-gold-600/30">
                  LEVEL {player.level}
                </span>
              </div>
              <p className="text-sm text-parchment-900/80 font-medium">
                {player.race} {player.className} • Folk Hero Background
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Rest Buttons */}
            <button
              onClick={restShort}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-parchment-300 hover:bg-parchment-400 text-obsidian-900 font-semibold text-xs border border-parchment-500 transition-all shadow-sm"
              title="Spend Hit Die to heal (1 hour)"
            >
              <Bed className="w-4 h-4 text-gold-700" />
              <span>Short Rest</span>
            </button>
            <button
              onClick={restLong}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 text-parchment-100 font-semibold text-xs border border-gold-500 transition-all shadow-md"
              title="Full recovery of HP and slots (8 hours)"
            >
              <Moon className="w-4 h-4 text-amber-400" />
              <span>Long Rest</span>
            </button>
            <button
              onClick={() => openCharacterSheet(false)}
              className="p-2 rounded-xl text-obsidian-800 hover:bg-parchment-300 transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {/* Key Vitals Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-parchment-50 border border-parchment-400 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-xs text-parchment-900/60 font-bold uppercase tracking-wider font-cinzel mb-1">
                <Heart className="w-4 h-4 text-blood-600" /> Max HP
              </div>
              <div className="text-2xl font-bold font-mono text-blood-700">
                {player.currentHp} / {player.maxHp}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-parchment-50 border border-parchment-400 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-xs text-parchment-900/60 font-bold uppercase tracking-wider font-cinzel mb-1">
                <Shield className="w-4 h-4 text-gold-700" /> Armor Class
              </div>
              <div className="text-2xl font-bold font-mono text-obsidian-900">
                {player.armorClass}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-parchment-50 border border-parchment-400 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-xs text-parchment-900/60 font-bold uppercase tracking-wider font-cinzel mb-1">
                <Zap className="w-4 h-4 text-amber-600" /> Speed
              </div>
              <div className="text-2xl font-bold font-mono text-obsidian-900">
                {player.speed} ft
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-parchment-50 border border-parchment-400 text-center shadow-sm">
              <div className="flex items-center justify-center gap-1 text-xs text-parchment-900/60 font-bold uppercase tracking-wider font-cinzel mb-1">
                <Sparkles className="w-4 h-4 text-purple-700" /> Proficiency
              </div>
              <div className="text-2xl font-bold font-mono text-obsidian-900">
                +2
              </div>
            </div>
          </div>

          {/* 6 Ability Scores Cards */}
          <div>
            <h3 className="font-cinzel text-sm font-bold text-obsidian-900 mb-3 tracking-wider uppercase">
              Ability Scores & Modifiers
            </h3>
            <div className="grid grid-cols-6 gap-3">
              {abilityKeys.map((key) => {
                const score = player.abilities[key];
                const mod = calculateAbilityModifier(score);
                const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                return (
                  <div
                    key={key}
                    className="p-3 rounded-2xl bg-parchment-50 border-2 border-gold-600/40 text-center shadow-sm"
                  >
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-parchment-900/70 font-cinzel">
                      {key}
                    </div>
                    <div className="text-2xl font-extrabold text-gold-700 font-cinzel my-1">
                      {modStr}
                    </div>
                    <div className="text-xs text-parchment-900/60 font-mono font-bold">
                      {score}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equipment & Inventory */}
          <div>
            <h3 className="font-cinzel text-sm font-bold text-obsidian-900 mb-3 tracking-wider uppercase">
              Equipped Armory & Satchel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {player.inventory.map((itemId, idx) => {
                const item = SRD_ITEMS[itemId];
                if (!item) return null;
                const isEquipped = player.equippedWeapon === itemId || player.equippedArmor === itemId || player.equippedShield === itemId;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-parchment-50 border border-parchment-400 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel font-bold text-sm text-obsidian-950">
                          {item.name}
                        </span>
                        {isEquipped && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase font-mono">
                            Equipped
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-parchment-900/70 mt-0.5">
                        {item.damageDice ? `${item.damageDice} ${item.damageType}` : item.category} • {item.weightLbs} lbs
                      </div>
                    </div>

                    {item.category === "weapon" && !isEquipped && (
                      <button
                        onClick={() => handleEquipWeapon(itemId)}
                        className="px-3 py-1 text-xs font-bold font-cinzel rounded-lg bg-gold-600 hover:bg-gold-700 text-white transition-all shadow-sm"
                      >
                        Wield
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danger Zone: Character Deletion */}
          <div className="pt-4 border-t border-parchment-400/60 flex items-center justify-between bg-parchment-100/50 p-4 rounded-2xl border border-blood-500/20">
            <div>
              <h4 className="font-cinzel text-xs font-bold text-blood-700 uppercase tracking-wider">
                Danger Zone • Rite of Ash
              </h4>
              <p className="text-[11px] text-parchment-900/70">
                Permanently incinerate this hero scroll and purge their campaign chronicle.
              </p>
            </div>

            <button
              onClick={() => {
                openCharacterSheet(false);
                openDeleteModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blood-100 hover:bg-blood-200 text-blood-800 border border-blood-400/60 font-cinzel font-bold text-xs transition-all shadow-sm hover:scale-[1.02] active:scale-98"
            >
              <Trash2 className="w-3.5 h-3.5 text-blood-700" />
              <span>Delete Character</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}