"use client";

import React, { useRef, useEffect } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { Scroll, Dices, AlertTriangle, CheckCircle2, ChevronRight, ShieldAlert } from "lucide-react";

export default function DMTerminal() {
  const { logs, pendingCheck, currentObjective, performSkillCheck, isDiceRolling } = useGameStore();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <aside className="w-96 h-full bg-obsidian-900 border-l border-gold-500/20 flex flex-col justify-between overflow-hidden z-20 backdrop-blur-md">
      {/* Terminal Header */}
      <div className="p-4 border-b border-gold-500/20 bg-obsidian-950/90">
        <div className="flex items-center gap-2.5 mb-2">
          <Scroll className="w-4 h-4 text-gold-400" />
          <h2 className="font-cinzel text-sm font-bold text-gold-400 tracking-wider">
            DM TERMINAL & LOG
          </h2>
        </div>

        {/* Current Objective Banner */}
        <div className="p-2.5 rounded-xl bg-obsidian-900 border border-gold-500/20 text-xs">
          <div className="flex items-center gap-1 text-[10px] font-bold text-gold-500 uppercase tracking-wider font-cinzel mb-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active Chronicle Objective</span>
          </div>
          <p className="text-parchment-200/90 text-[11px] leading-relaxed font-body">
            {currentObjective}
          </p>
        </div>
      </div>

      {/* Narrative & Action Log Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {logs.map((log) => {
          const isDM = log.role === "dm";
          const isPlayer = log.role === "player";
          const isCompanion = log.role === "companion";

          return (
            <div
              key={log.id}
              className={`p-3.5 rounded-xl text-xs leading-relaxed border transition-all ${
                isDM
                  ? "bg-obsidian-950/80 border-gold-500/25 text-parchment-100 shadow-md"
                  : isPlayer
                  ? "bg-blood-950/40 border-blood-500/40 text-parchment-100 ml-4 shadow-sm"
                  : isCompanion
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-100 italic"
                  : "bg-obsidian-850/80 border-gold-500/15 text-parchment-300 font-mono text-[11px]"
              }`}
            >
              <div className="flex items-center justify-between mb-1 text-[10px] font-bold tracking-wider font-cinzel">
                <span
                  className={
                    isDM
                      ? "text-gold-400"
                      : isPlayer
                      ? "text-blood-400"
                      : isCompanion
                      ? "text-emerald-400"
                      : "text-parchment-400"
                  }
                >
                  {log.speaker || (isDM ? "DUNGEON MASTER" : "CHRONICLER")}
                </span>
                <span className="text-parchment-300/40 font-mono">{log.timestamp}</span>
              </div>

              <div className="whitespace-pre-line font-body">{log.text}</div>

              {log.rollBreakdown && (
                <div className="mt-2 pt-2 border-t border-gold-500/15 flex items-center gap-1.5 text-[11px] font-mono text-gold-400/90">
                  <Dices className="w-3.5 h-3.5 text-gold-400" />
                  <span>Formula: {log.rollBreakdown}</span>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Active Pending Skill Check Alert */}
      {pendingCheck && (
        <div className="p-4 border-t border-gold-500/30 bg-gradient-to-t from-obsidian-950 to-obsidian-900">
          <div className="p-3.5 rounded-xl bg-obsidian-950 border-2 border-gold-500/60 shadow-gold-glow">
            <div className="flex items-center gap-2 text-gold-400 font-cinzel font-bold text-xs mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>SKILL CHECK REQUIRED</span>
            </div>
            <p className="text-xs text-parchment-200 mb-3">
              {pendingCheck.reason}
            </p>

            <button
              onClick={() =>
                performSkillCheck(pendingCheck.skill, pendingCheck.dc, pendingCheck.ability)
              }
              disabled={isDiceRolling}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 font-cinzel font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
            >
              <Dices className="w-4 h-4" />
              <span>
                {isDiceRolling
                  ? "ROLLING D20..."
                  : `ROLL ${pendingCheck.skill.toUpperCase()} (DC ${pendingCheck.dc})`}
              </span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}