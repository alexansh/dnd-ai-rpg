"use client";

import React, { useRef, useEffect, useState } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { calculateDistanceFt, isWithinRange } from "@/lib/engine/tactical";
import AttackPanel from "@/components/combat/AttackPanel";

export default function TacticalGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { combat, tacticalMap, selectedCombatantId, movePlayerCombatant, executePlayerCombatAttack } = useGameStore();

  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);

  const cellSize = 54; // pixels per 5ft square

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tacticalMap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Grid Tiles
    for (let y = 0; y < tacticalMap.height; y++) {
      for (let x = 0; x < tacticalMap.width; x++) {
        const key = `${x},${y}`;
        const node = tacticalMap.nodes[key];
        const px = x * cellSize;
        const py = y * cellSize;

        if (!node) continue;

        // Base tile colors
        if (node.terrain === "wall") {
          ctx.fillStyle = "#0c0e14";
          ctx.fillRect(px, py, cellSize, cellSize);
          ctx.strokeStyle = "#242a3d";
          ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
        } else if (node.terrain === "pillar") {
          ctx.fillStyle = "#181d2a";
          ctx.fillRect(px, py, cellSize, cellSize);
          ctx.fillStyle = "#363e59";
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#d4a737";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (node.terrain === "crypt_sarcophagus") {
          ctx.fillStyle = "#242a3d";
          ctx.fillRect(px + 4, py + 8, cellSize - 8, cellSize - 16);
          ctx.strokeStyle = "#d4a737";
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 4, py + 8, cellSize - 8, cellSize - 16);
        } else if (node.terrain === "water") {
          ctx.fillStyle = "#0d2038";
          ctx.fillRect(px, py, cellSize, cellSize);
          ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
          ctx.fillRect(px, py, cellSize, cellSize);
        } else {
          // Normal stone floor
          ctx.fillStyle = (x + y) % 2 === 0 ? "#12151f" : "#141824";
          ctx.fillRect(px, py, cellSize, cellSize);
        }

        // Grid lines
        ctx.strokeStyle = "rgba(212, 167, 55, 0.08)";
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, cellSize, cellSize);
      }
    }

    if (!combat) return;

    const activeCombatant = combat.combatants[combat.activeTurnIndex];

    // 2. Draw Movement Range Highlight for active player
    if (activeCombatant && activeCombatant.isPlayer) {
      const remainingSpeed = activeCombatant.speed - activeCombatant.movementUsedFt;
      for (let y = 0; y < tacticalMap.height; y++) {
        for (let x = 0; x < tacticalMap.width; x++) {
          const key = `${x},${y}`;
          const node = tacticalMap.nodes[key];
          if (node && node.terrain !== "wall" && node.terrain !== "pillar") {
            const dist = calculateDistanceFt(activeCombatant.gridPosition, { x, y });
            if (dist <= remainingSpeed && dist > 0) {
              ctx.fillStyle = "rgba(59, 130, 246, 0.12)";
              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
          }
        }
      }
    }

    // 3. Draw Hover Indicator
    if (hoverPos) {
      ctx.strokeStyle = "rgba(212, 167, 55, 0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(hoverPos.x * cellSize, hoverPos.y * cellSize, cellSize, cellSize);
    }

    // 4. Draw Combatants
    combat.combatants.forEach((c) => {
      if (c.currentHp <= 0) return; // don't draw dead

      const cx = c.gridPosition.x * cellSize + cellSize / 2;
      const cy = c.gridPosition.y * cellSize + cellSize / 2;
      const radius = cellSize * 0.38;

      // Active turn glowing ring
      if (activeCombatant && activeCombatant.id === c.id) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "#d4a737";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#d4a737";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Base token circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = c.isPlayer
        ? "#1e40af"
        : c.isCompanion
        ? "#15803d"
        : "#991b1b";
      ctx.fill();
      ctx.strokeStyle = "#d4a737";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Initial letter
      ctx.fillStyle = "#fdfbf7";
      ctx.font = "bold 16px Cinzel, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(c.name.charAt(0), cx, cy - 2);

      // Mini HP bar under token
      const hpPct = Math.max(0, c.currentHp / c.maxHp);
      const barW = cellSize * 0.7;
      const barH = 4;
      const barX = cx - barW / 2;
      const barY = cy + radius + 3;

      ctx.fillStyle = "#0c0e14";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = hpPct > 0.5 ? "#22c55e" : hpPct > 0.25 ? "#eab308" : "#ef4444";
      ctx.fillRect(barX, barY, barW * hpPct, barH);
    });
  }, [tacticalMap, combat, hoverPos, selectedCombatantId]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !tacticalMap) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    if (x >= 0 && x < tacticalMap.width && y >= 0 && y < tacticalMap.height) {
      setHoverPos({ x, y });
    } else {
      setHoverPos(null);
    }
  };

  const handleCanvasClick = () => {
    if (!hoverPos || !combat || !tacticalMap) return;

    const activeCombatant = combat.combatants[combat.activeTurnIndex];
    if (!activeCombatant || !activeCombatant.isPlayer) return;

    // Check if clicked an enemy
    const targetEnemy = combat.combatants.find(
      (c) => c.isEnemy && c.currentHp > 0 && c.gridPosition.x === hoverPos.x && c.gridPosition.y === hoverPos.y
    );

    if (targetEnemy) {
      setPendingTargetId(targetEnemy.id);
      return;
    }

    // Otherwise move to destination if empty and within speed
    const node = tacticalMap.nodes[`${hoverPos.x},${hoverPos.y}`];
    if (node && node.terrain !== "wall" && node.terrain !== "pillar") {
      movePlayerCombatant(hoverPos);
    }
  };

  if (!tacticalMap) return null;

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-obsidian-950/80 rounded-xl border border-gold-500/30 backdrop-blur-md">
      {/* Confirm-before-commit Attack Panel */}
      <AttackPanel
        targetId={pendingTargetId}
        onClose={() => setPendingTargetId(null)}
        onConfirm={(targetId) => executePlayerCombatAttack(targetId)}
      />

      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blood-500 animate-pulse" />
          <h3 className="font-cinzel text-sm font-bold text-gold-400 tracking-wider">
            TACTICAL ENGAGEMENT GRID (5 FT SQUARES)
          </h3>
        </div>
        <div className="text-xs text-parchment-300/70 font-mono">
          {hoverPos ? `Cursor: (${hoverPos.x}, ${hoverPos.y})` : "Click tile to Move / Click adjacent foe to Attack"}
        </div>
      </div>

      <div className="overflow-auto max-w-full rounded-lg border border-gold-500/20 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={tacticalMap.width * cellSize}
          height={tacticalMap.height * cellSize}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoverPos(null)}
          onClick={handleCanvasClick}
          className="cursor-crosshair block"
        />
      </div>

      <div className="flex items-center gap-6 mt-3 text-xs text-parchment-300/80">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-700 border border-gold-500" />
          <span>You</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-700 border border-gold-500" />
          <span>Companions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-700 border border-gold-500" />
          <span>Enemies</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-obsidian-700 border border-gold-500/50" />
          <span>Pillars (+5 AC Cover)</span>
        </div>
      </div>
    </div>
  );
}