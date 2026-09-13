"use client";

import React, { useState } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import {
  getItemDefinition,
  calculateInventoryWeight,
  calculateCarryCapacity,
  getRarityStyles,
} from "@/lib/engine/inventory";
import { Coins, Shield, Swords, Sparkles, Heart, Package, AlertTriangle, Check } from "lucide-react";

export default function InventoryPanel() {
  const { player, equipItem, unequipItem, useConsumable } = useGameStore();
  const [filter, setFilter] = useState<"all" | "weapon" | "armor" | "potion" | "gear">("all");

  if (!player) return null;

  const gold = player.gold ?? 50;
  const currentWeight = calculateInventoryWeight(player.inventory);
  const capacityInfo = calculateCarryCapacity(player.abilities.str);
  const status = capacityInfo.checkStatus(currentWeight);

  // Group inventory items by ID with quantities
  const itemCounts = player.inventory.reduce<Record<string, number>>((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const uniqueItemIds = Object.keys(itemCounts);

  const filteredItems = uniqueItemIds.filter((id) => {
    if (filter === "all") return true;
    const def = getItemDefinition(id);
    if (!def) return filter === "gear";
    if (filter === "armor") return def.category === "armor" || def.category === "shield";
    return def.category === filter;
  });

  return (
    <div className="space-y-4">
      {/* Top Header: Gold Purse & Weight Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-parchment-100/80 border border-parchment-300">
        {/* Currency Purse */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md border border-amber-300">
            <Coins className="w-6 h-6 text-obsidian-950" />
          </div>
          <div>
            <div className="text-xs font-cinzel font-bold text-parchment-900/70 uppercase tracking-wider">
              Coin Purse
            </div>
            <div className="text-2xl font-bold font-cinzel text-amber-800 flex items-center gap-1.5">
              <span>{gold}</span>
              <span className="text-sm font-semibold text-parchment-800">GP</span>
            </div>
          </div>
        </div>

        {/* Encumbrance & Carry Capacity */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs font-bold font-cinzel mb-1">
            <span className="text-parchment-900/80 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-parchment-800" />
              Weight Burden
            </span>
            <span
              className={
                status.isOverCapacity
                  ? "text-blood-700 font-bold"
                  : status.isEncumbered
                  ? "text-amber-700 font-bold"
                  : "text-parchment-900/90"
              }
            >
              {currentWeight} / {capacityInfo.maxLbs} lbs ({status.capacityPercent}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-parchment-300 overflow-hidden border border-parchment-400 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                status.isOverCapacity
                  ? "bg-blood-600"
                  : status.isEncumbered
                  ? "bg-amber-500"
                  : "bg-emerald-600"
              }`}
              style={{ width: `${Math.min(100, status.capacityPercent)}%` }}
            />
          </div>

          {status.isEncumbered && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 mt-1">
              <AlertTriangle className="w-3 h-3" />
              <span>
                {status.isOverCapacity
                  ? "Over capacity! Speed reduced to 5 ft."
                  : "Encumbered! Speed reduced by 10 ft."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: "all", label: "All Items" },
            { id: "weapon", label: "Weapons" },
            { id: "armor", label: "Armor & Shields" },
            { id: "potion", label: "Elixirs & Potions" },
            { id: "gear", label: "Adventuring Gear" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1 rounded-xl text-xs font-bold font-cinzel transition-all ${
              filter === tab.id
                ? "bg-gold-600 text-white shadow-sm"
                : "bg-parchment-200/90 hover:bg-parchment-300 text-obsidian-900 border border-parchment-400/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-parchment-700/70 font-cinzel text-sm border-2 border-dashed border-parchment-300 rounded-2xl">
          No items found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredItems.map((itemId) => {
            const def = getItemDefinition(itemId);
            const count = itemCounts[itemId];
            const isEquippedWeapon = player.equippedWeapon === itemId;
            const isEquippedArmor = player.equippedArmor === itemId;
            const isEquippedShield = player.equippedShield === itemId;
            const isEquipped = isEquippedWeapon || isEquippedArmor || isEquippedShield;
            const rarity = def?.rarity || "common";
            const rarityStyles = getRarityStyles(rarity);

            return (
              <div
                key={itemId}
                className={`p-3.5 rounded-2xl bg-parchment-50/90 border-2 transition-all flex flex-col justify-between ${
                  isEquipped ? "border-gold-500 shadow-sm" : "border-parchment-300 hover:border-parchment-400"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-cinzel font-bold text-sm text-obsidian-950">
                        {def?.name || itemId}
                      </span>
                      {count > 1 && (
                        <span className="px-1.5 py-0.2 rounded-md bg-parchment-300 text-obsidian-900 font-mono text-xs font-bold">
                          ×{count}
                        </span>
                      )}
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${rarityStyles.badge}`}
                      >
                        {rarity}
                      </span>
                    </div>

                    {isEquipped && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold uppercase font-mono">
                        <Check className="w-2.5 h-2.5" /> Equipped
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-parchment-900/80 mt-1 line-clamp-2">
                    {def?.description || "A curious adventurer's item."}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-parchment-900/70 font-mono mt-2">
                    {def?.damageDice && (
                      <span className="font-semibold text-blood-700">
                        ⚔ {def.damageDice} {def.damageType}
                      </span>
                    )}
                    {def?.baseArmorClass && (
                      <span className="font-semibold text-gold-700">
                        🛡 AC {def.baseArmorClass}
                      </span>
                    )}
                    {def?.armorClassBonus && (
                      <span className="font-semibold text-gold-700">
                        🛡 +{def.armorClassBonus} AC
                      </span>
                    )}
                    <span>⚖ {(def?.weightLbs ?? 1) * count} lbs</span>
                    {def?.cost && <span>💰 {def.cost}</span>}
                  </div>
                </div>

                {/* Actions: Equip, Unequip, Use */}
                <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-parchment-300/60">
                  {def?.category === "weapon" && (
                    <>
                      {isEquippedWeapon ? (
                        <button
                          onClick={() => unequipItem("weapon")}
                          className="px-2.5 py-1 text-xs font-bold font-cinzel rounded-lg bg-parchment-300 hover:bg-parchment-400 text-obsidian-900 transition-colors"
                        >
                          Sheathe
                        </button>
                      ) : (
                        <button
                          onClick={() => equipItem(itemId, "weapon")}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-bold font-cinzel rounded-lg bg-gold-600 hover:bg-gold-700 text-white transition-all shadow-sm"
                        >
                          <Swords className="w-3 h-3" /> Wield
                        </button>
                      )}
                    </>
                  )}

                  {def?.category === "armor" && (
                    <>
                      {isEquippedArmor ? (
                        <button
                          onClick={() => unequipItem("armor")}
                          className="px-2.5 py-1 text-xs font-bold font-cinzel rounded-lg bg-parchment-300 hover:bg-parchment-400 text-obsidian-900 transition-colors"
                        >
                          Doff
                        </button>
                      ) : (
                        <button
                          onClick={() => equipItem(itemId, "armor")}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-bold font-cinzel rounded-lg bg-gold-600 hover:bg-gold-700 text-white transition-all shadow-sm"
                        >
                          <Shield className="w-3 h-3" /> Don Armor
                        </button>
                      )}
                    </>
                  )}

                  {def?.category === "shield" && (
                    <>
                      {isEquippedShield ? (
                        <button
                          onClick={() => unequipItem("shield")}
                          className="px-2.5 py-1 text-xs font-bold font-cinzel rounded-lg bg-parchment-300 hover:bg-parchment-400 text-obsidian-900 transition-colors"
                        >
                          Lower Shield
                        </button>
                      ) : (
                        <button
                          onClick={() => equipItem(itemId, "shield")}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-bold font-cinzel rounded-lg bg-gold-600 hover:bg-gold-700 text-white transition-all shadow-sm"
                        >
                          <Shield className="w-3 h-3" /> Raise Shield
                        </button>
                      )}
                    </>
                  )}

                  {def?.category === "potion" && (
                    <button
                      onClick={() => useConsumable(itemId)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-bold font-cinzel rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
                    >
                      <Heart className="w-3 h-3 text-emerald-100" /> Quaff
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
