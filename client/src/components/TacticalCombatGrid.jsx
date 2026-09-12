import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Swords,
  Shield,
  Heart,
  Zap,
  Flame,
  Target,
  Move,
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { soundFx } from '../services/audio';

const GRID_COLS = 8;
const GRID_ROWS = 6;

export default function TacticalCombatGrid({
  player,
  companions = [],
  monsters = [],
  onPlayerAction,
  onEndTurn,
  isPlayerTurn = true
}) {
  // Grid entities state
  const [entities, setEntities] = useState(() => {
    const list = [
      {
        id: 'player',
        name: player?.name || 'Hero',
        type: 'player',
        x: 1,
        y: 2,
        hp: player?.hp || 20,
        maxHp: player?.maxHp || 20,
        icon: '🗡️',
        color: 'border-amber-400 bg-amber-950/80',
        ac: 15
      },
      ...companions.map((c, i) => ({
        id: c.id,
        name: c.name,
        type: 'companion',
        x: 1,
        y: 1 + i * 2,
        hp: c.hp || 18,
        maxHp: c.maxHp || 18,
        icon: c.class?.toLowerCase().includes('cleric') ? '✨' : '🛡️',
        color: 'border-blue-400 bg-blue-950/80',
        ac: 16
      })),
      ...monsters.map((m, i) => ({
        id: `monster_${i}`,
        name: m.name || 'Monster',
        type: 'enemy',
        x: 6,
        y: 1 + i * 2,
        hp: m.hp || 15,
        maxHp: m.maxHp || 15,
        icon: '💀',
        color: 'border-red-500 bg-red-950/80',
        ac: m.ac || 12
      })),
      // Environmental obstacles / cover
      { id: 'pillar_1', name: 'Stone Pillar', type: 'cover_half', x: 3, y: 2, icon: '🏛️', coverBonus: 2 },
      { id: 'barrel_1', name: 'Explosive Oil Barrel', type: 'hazard', x: 4, y: 3, icon: '🛢️', damage: '2d6' }
    ];
    return list;
  });

  const [selectedEntityId, setSelectedEntityId] = useState('player');
  const [targetEnemyId, setTargetEnemyId] = useState(null);
  const [actionLog, setActionLog] = useState(['⚔️ Tactical Encounter Engaged. Select actions or position on the grid.']);

  const selectedEntity = entities.find(e => e.id === selectedEntityId);
  const targetEnemy = entities.find(e => e.id === targetEnemyId);

  // Compute Manhattan distance in grid squares
  const getDistance = (e1, e2) => {
    if (!e1 || !e2) return 999;
    return Math.abs(e1.x - e2.x) + Math.abs(e1.y - e2.y);
  };

  const handleCellClick = (x, y) => {
    // Check if cell has an entity
    const occupying = entities.find(e => e.x === x && e.y === y);
    if (occupying) {
      if (occupying.type === 'enemy') {
        soundFx.playClick();
        setTargetEnemyId(occupying.id);
      } else if (occupying.type === 'player' || occupying.type === 'companion') {
        soundFx.playClick();
        setSelectedEntityId(occupying.id);
      }
      return;
    }

    // Otherwise move selected entity if within range (3 squares)
    if (selectedEntity && (selectedEntity.type === 'player' || selectedEntity.type === 'companion')) {
      const dist = Math.abs(selectedEntity.x - x) + Math.abs(selectedEntity.y - y);
      if (dist <= 3) {
        soundFx.playDiceRoll();
        setEntities(prev => prev.map(e => (e.id === selectedEntity.id ? { ...e, x, y } : e)));
        setActionLog(prev => [`👣 ${selectedEntity.name} moved to (${x}, ${y})`, ...prev].slice(0, 5));
      }
    }
  };

  const handleAttackTarget = () => {
    if (!selectedEntity || !targetEnemy) return;
    const distance = getDistance(selectedEntity, targetEnemy);
    const inRange = distance <= 2; // Melee/near range

    soundFx.triggerSting('sword_clash');
    const attackRoll = Math.floor(Math.random() * 20) + 1 + 5;
    const isHit = attackRoll >= targetEnemy.ac;

    if (isHit) {
      const damage = Math.floor(Math.random() * 8) + 3;
      soundFx.playSuccess(false);
      setEntities(prev => prev.map(e => {
        if (e.id === targetEnemy.id) {
          const newHp = Math.max(0, e.hp - damage);
          return { ...e, hp: newHp };
        }
        return e;
      }));
      setActionLog(prev => [
        `💥 ${selectedEntity.name} struck ${targetEnemy.name} for ${damage} damage! (Roll: ${attackRoll} vs AC ${targetEnemy.ac})`,
        ...prev
      ].slice(0, 5));
      if (onPlayerAction) {
        onPlayerAction(`Attacked ${targetEnemy.name} for ${damage} damage!`);
      }
    } else {
      soundFx.playFailure();
      setActionLog(prev => [
        `🛡️ ${selectedEntity.name}'s attack missed ${targetEnemy.name} (Roll: ${attackRoll} vs AC ${targetEnemy.ac})`,
        ...prev
      ].slice(0, 5));
    }
  };

  const handleIgniteBarrel = () => {
    const barrel = entities.find(e => e.type === 'hazard');
    if (!barrel) return;
    soundFx.triggerSting('secret_found');
    const explosionDamage = Math.floor(Math.random() * 12) + 4;

    // Damage all entities within 2 squares of the barrel
    setEntities(prev => prev
      .filter(e => e.id !== barrel.id) // Barrel destroyed
      .map(e => {
        const dist = Math.abs(e.x - barrel.x) + Math.abs(e.y - barrel.y);
        if (dist <= 2 && e.hp) {
          return { ...e, hp: Math.max(0, e.hp - explosionDamage) };
        }
        return e;
      })
    );

    setActionLog(prev => [
      `🔥 BOOM! Oil barrel detonated dealing ${explosionDamage} fire damage to nearby combatants!`,
      ...prev
    ].slice(0, 5));
  };

  return (
    <div className="w-full bg-stone-950/95 border-2 border-red-900/60 rounded-2xl p-4 shadow-2xl space-y-4 animate-fade-in text-tavern-parchment">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-900/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-950 border border-red-600/60">
            <Swords className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-cinzel text-base font-bold text-red-300">Tactical Combat Grid (5e)</h3>
            <p className="text-xs text-tavern-parchment/60 font-sans">2D Positioning, Line of Sight & Cover</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEndTurn}
            className="px-3 py-1.5 rounded-lg bg-tavern-wood hover:bg-tavern-umber border border-tavern-gold/40 text-tavern-gold font-cinzel text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>End Turn</span>
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="relative overflow-x-auto p-2 bg-stone-900/60 rounded-xl border border-stone-800">
        <div
          className="grid gap-1.5 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(44px, 1fr))`,
            width: '100%',
            maxWidth: '560px'
          }}
        >
          {Array.from({ length: GRID_ROWS }).map((_, r) => (
            Array.from({ length: GRID_COLS }).map((__, c) => {
              const entity = entities.find(e => e.x === c && e.y === r);
              const isSelected = entity && entity.id === selectedEntityId;
              const isTargeted = entity && entity.id === targetEnemyId;

              // Highlight reachable squares
              const canMoveHere = selectedEntity && !entity &&
                (Math.abs(selectedEntity.x - c) + Math.abs(selectedEntity.y - r) <= 3);

              return (
                <div
                  key={`${c}-${r}`}
                  onClick={() => handleCellClick(c, r)}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-950/40'
                      : isTargeted
                      ? 'border-red-500 ring-2 ring-red-500/50 bg-red-950/40'
                      : canMoveHere
                      ? 'border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-900/40'
                      : 'border-stone-800/80 bg-stone-950/60 hover:bg-stone-800/40'
                  }`}
                >
                  {entity && (
                    <motion.div
                      layoutId={entity.id}
                      className="flex flex-col items-center justify-center text-center select-none"
                    >
                      <span className="text-xl">{entity.icon}</span>
                      {entity.hp !== undefined && (
                        <div className="w-8 h-1.5 bg-stone-800 rounded-full overflow-hidden mt-0.5 border border-stone-700">
                          <div
                            className={`h-full ${entity.type === 'enemy' ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (entity.hp / entity.maxHp) * 100)}%` }}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                  {canMoveHere && !entity && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>

      {/* Selected Action Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-red-900/30 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-tavern-gold font-bold">Selected:</span>
            <span>{selectedEntity?.name || 'None'}</span>
            {selectedEntity?.hp && (
              <span className="text-emerald-400">({selectedEntity.hp}/{selectedEntity.maxHp} HP)</span>
            )}
          </div>
          {targetEnemy && (
            <div className="flex items-center gap-1.5 border-l border-stone-700 pl-3">
              <span className="text-red-400 font-bold">Target:</span>
              <span>{targetEnemy.name}</span>
              <span className="text-red-300">({targetEnemy.hp}/{targetEnemy.maxHp} HP • AC {targetEnemy.ac})</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {targetEnemy && (
            <button
              onClick={handleAttackTarget}
              className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-cinzel font-bold shadow-md transition flex items-center gap-1"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Attack Target</span>
            </button>
          )}

          {entities.some(e => e.type === 'hazard') && (
            <button
              onClick={handleIgniteBarrel}
              className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-cinzel font-bold shadow-md transition flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Ignite Oil Barrel</span>
            </button>
          )}
        </div>
      </div>

      {/* Mini Battle Log */}
      <div className="bg-black/40 rounded-lg p-2 text-[11px] font-mono space-y-1 text-tavern-parchment/80 border border-stone-800">
        {actionLog.map((log, i) => (
          <div key={i} className="leading-tight">{log}</div>
        ))}
      </div>
    </div>
  );
}
