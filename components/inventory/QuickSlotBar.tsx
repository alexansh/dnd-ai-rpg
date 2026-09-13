"use client";

import React from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { getItemDefinition } from "@/lib/engine/inventory";
import { Heart, Flame, Sparkles, Shield, FlaskRound } from "lucide-react";

export default function QuickSlotBar() {
  const { player, useConsumable } = useGameStore();

  if (!player) return null;

  // Filter consumables from inventory
  const consumableCounts = player.inventory.reduce<Record<string, number>>((acc, id) => {
    const def = getItemDefinition(id);
    if (def?.category === "potion" || id === "torch" || id.includes("scroll") || id.includes("potion")) {
      acc[id] = (acc[id] || 0) + 1;
    }
    return acc;
  }, {});

  const consumableIds = Object.keys(consumableCounts).slice(0, 4);

  if (consumableIds.length === 0) return null;

  const getItemIcon = (id: string) => {
    if (id.includes("heal")) return <Heart className="w-4 h-4 text-emerald-400" />;
    if (id.includes("torch") || id.includes("fire")) return <Flame className="w-4 h-4 text-amber-400" />;
    if (id.includes("invis")) return <Sparkles className="w-4 h-4 text-purple-400" />;
    return <FlaskRound className="w-4 h-4 text-amber-300" />;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-obsidian-900/90 border border-gold-600/40 backdrop-blur-md shadow-xl text-parchment-100">
      <span className="text-[10px] font-cinzel font-extrabold uppercase tracking-widest text-gold-500/80 mr-1 hidden sm:inline">
        Quick Slots
      </span>

      <div className="flex items-center gap-2">
        {consumableIds.map((itemId) => {
          const def = getItemDefinition(itemId);
          const count = consumableCounts[itemId];
          const name = def?.name || itemId;

          return (
            <button
              key={itemId}
              onClick={() => useConsumable(itemId)}
              className="relative group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-obsidian-950/80 hover:bg-obsidian-800 border border-gold-500/30 hover:border-gold-400 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title={`${name}: Click to use immediately (${def?.description || ""})`}
            >
              <div className="w-5 h-5 rounded-lg bg-black/40 flex items-center justify-center">
                {getItemIcon(itemId)}
              </div>
              <span className="text-xs font-cinzel font-bold text-parchment-200 group-hover:text-gold-400 max-w-[90px] truncate">
                {name.replace("Potion of ", "Pot. ")}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-gold-600/30 text-gold-300 font-mono text-[10px] font-bold border border-gold-500/30">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
