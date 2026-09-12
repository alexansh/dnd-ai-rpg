"use client";

import React, { useEffect } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import confetti from "canvas-confetti";
import { Dices, Sparkles, AlertCircle, X } from "lucide-react";

export default function DiceTray() {
  const { activeDiceRoll, isDiceRolling } = useGameStore();

  useEffect(() => {
    if (activeDiceRoll?.isNat20) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#d4a737", "#f0ce6b", "#fdfbf7"],
      });
    }
  }, [activeDiceRoll]);

  if (!isDiceRolling && !activeDiceRoll) return null;

  return (
    <div className="fixed bottom-24 right-96 mr-6 z-40 pointer-events-none">
      <div className="p-4 rounded-2xl bg-obsidian-950/95 border-2 border-gold-500/60 shadow-gold-glow-lg pointer-events-auto backdrop-blur-md min-w-[280px] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between pb-2 border-b border-gold-500/20 mb-3">
          <div className="flex items-center gap-2 text-gold-400 font-cinzel font-bold text-xs">
            <Dices className="w-4 h-4 animate-spin-slow" />
            <span>{activeDiceRoll?.label || "DICE ROLLER"}</span>
          </div>
          <span className="font-mono text-[10px] text-parchment-300/50">5e Math Engine</span>
        </div>

        {isDiceRolling ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-600 to-gold-400 border-2 border-gold-300 flex items-center justify-center shadow-gold-glow animate-bounce">
              <span className="font-cinzel text-2xl font-bold text-obsidian-950">d20</span>
            </div>
            <p className="text-xs font-cinzel text-gold-400 animate-pulse font-bold tracking-wider">
              CONSULTING THE FATES...
            </p>
          </div>
        ) : activeDiceRoll ? (
          <div className="flex flex-col items-center text-center space-y-2">
            {/* Total Result Badge */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-2xl transition-all ${
                activeDiceRoll.isNat20
                  ? "bg-gradient-to-br from-emerald-600 to-emerald-400 border-emerald-300 text-white shadow-emerald-500/50 scale-105"
                  : activeDiceRoll.isNat1
                  ? "bg-gradient-to-br from-blood-700 to-blood-500 border-blood-400 text-white shadow-blood-glow"
                  : "bg-gradient-to-br from-gold-600 to-gold-400 border-gold-300 text-obsidian-950 shadow-gold-glow"
              }`}
            >
              <span className="font-cinzel text-3xl font-extrabold">{activeDiceRoll.total}</span>
            </div>

            {/* Critical Banner */}
            {activeDiceRoll.isNat20 && (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 font-cinzel tracking-wider animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NATURAL 20! CRITICAL!</span>
              </div>
            )}
            {activeDiceRoll.isNat1 && (
              <div className="flex items-center gap-1 text-xs font-bold text-blood-400 font-cinzel tracking-wider animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>NATURAL 1! CRITICAL FUMBLE!</span>
              </div>
            )}

            {/* Formula Breakdown */}
            <div className="px-3 py-1.5 rounded-lg bg-obsidian-900 border border-gold-500/20 text-xs font-mono text-parchment-200">
              {activeDiceRoll.explanation}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}