"use client";

import React from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { calculateHitProbability } from "@/lib/engine/combat";
import { calculateDistanceFt } from "@/lib/engine/tactical";
import { Swords, Shield, Heart, Crosshair, X, AlertCircle } from "lucide-react";

interface AttackPanelProps {
  targetId: string | null;
  onClose: () => void;
  onConfirm: (targetId: string) => void;
}

export default function AttackPanel({ targetId, onClose, onConfirm }: AttackPanelProps) {
  const { combat, player } = useGameStore();

  if (!combat || !targetId || !player) return null;

  const activeCombatant = combat.combatants[combat.activeTurnIndex];
  const target = combat.combatants.find((c) => c.id === targetId);

  if (!target || !activeCombatant || !activeCombatant.isPlayer) return null;

  const distanceFt = calculateDistanceFt(activeCombatant.gridPosition, target.gridPosition);
  const isMelee = distanceFt <= 5;
  const isRanged = distanceFt > 5 && distanceFt <= 80;
  const inRange = isMelee || isRanged;

  // Cover bonus calculation (simplified default 0 or +2 if diagonal/corner)
  const coverBonus = 0;
  const attackBonus = activeCombatant.weaponAttackBonus;
  const { probabilityPercent, toHitNeeded, effectiveAC } = calculateHitProbability(
    attackBonus,
    target.armorClass,
    coverBonus
  );

  return (
    <div className="absolute top-4 right-4 z-30 w-80 p-4 rounded-2xl bg-obsidian-950/95 border-2 border-gold-500/70 backdrop-blur-md shadow-2xl text-parchment-100 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gold-500/30">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-blood-500" />
          <h4 className="font-cinzel font-bold text-xs uppercase tracking-wider text-gold-400">
            Targeting Acquisition (5e)
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-parchment-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Target Info */}
      <div className="flex items-center gap-3 my-3 p-2.5 rounded-xl bg-obsidian-900/80 border border-gold-500/20">
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-blood-500/40 flex-shrink-0">
          <img src={target.portrait} alt={target.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-cinzel font-bold text-sm text-parchment-100 truncate">
            {target.name}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono mt-0.5 text-parchment-300/80">
            <span className="flex items-center gap-1 text-blood-400">
              <Heart className="w-3 h-3" /> {target.currentHp}/{target.maxHp} HP
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-gold-400">
              <Shield className="w-3 h-3" /> AC {target.armorClass}
            </span>
          </div>
        </div>
      </div>

      {/* Attack Review & Chance calculation */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-parchment-300">
          <span>Attack Mode:</span>
          <span className="font-semibold text-gold-300 font-cinzel">
            {isMelee ? "Melee Strike (5 ft)" : `Ranged Strike (${distanceFt} ft)`}
          </span>
        </div>

        <div className="flex items-center justify-between text-parchment-300">
          <span>Attack Bonus:</span>
          <span className="font-mono font-bold text-gold-400">
            +{attackBonus} to hit
          </span>
        </div>

        <div className="flex items-center justify-between text-parchment-300">
          <span>Damage Formula:</span>
          <span className="font-mono font-bold text-blood-400">
            {activeCombatant.weaponDamageDice} {activeCombatant.weaponDamageType}
          </span>
        </div>

        {/* Hit Probability Meter */}
        <div className="pt-2 border-t border-gold-500/20">
          <div className="flex items-center justify-between font-cinzel font-bold text-xs mb-1">
            <span className="text-parchment-300">Estimated Hit Chance:</span>
            <span
              className={
                probabilityPercent >= 70
                  ? "text-emerald-400 font-bold"
                  : probabilityPercent >= 45
                  ? "text-amber-400 font-bold"
                  : "text-blood-400 font-bold"
              }
            >
              {probabilityPercent}% (Need {Math.max(2, toHitNeeded)}+ on d20)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-obsidian-800 overflow-hidden border border-gold-500/30 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                probabilityPercent >= 70
                  ? "bg-emerald-500"
                  : probabilityPercent >= 45
                  ? "bg-amber-500"
                  : "bg-blood-500"
              }`}
              style={{ width: `${probabilityPercent}%` }}
            />
          </div>
        </div>

        {!inRange && (
          <div className="flex items-center gap-1.5 text-blood-400 font-semibold text-[11px] p-2 rounded-lg bg-blood-950/40 border border-blood-500/30">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Target is out of reach ({distanceFt} ft). Move closer first!</span>
          </div>
        )}

        {activeCombatant.actionUsed && (
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px] p-2 rounded-lg bg-amber-950/40 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Main Action already expended this turn!</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-2 border-t border-gold-500/30">
        <button
          onClick={onClose}
          className="flex-1 py-1.5 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 border border-gold-500/30 text-parchment-300 font-cinzel font-semibold text-xs transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={!inRange || activeCombatant.actionUsed}
          onClick={() => {
            onConfirm(target.id);
            onClose();
          }}
          className="flex-[2] flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-gradient-to-r from-blood-700 to-blood-600 hover:from-blood-600 hover:to-blood-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-cinzel font-bold text-xs shadow-lg transition-all hover:scale-[1.02] active:scale-98 border border-blood-400/50"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Confirm Strike</span>
        </button>
      </div>
    </div>
  );
}
