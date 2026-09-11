import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Shield, Heart, Zap, Crosshair, Sparkles, Wind, Eye, Skull, ArrowRight, Activity, ShieldAlert } from 'lucide-react';
import { soundFx } from '../services/audio';

const CONDITIONS = [
  { id: 'Poisoned', label: 'Poisoned', color: 'bg-emerald-950 text-emerald-300 border-emerald-500' },
  { id: 'Prone', label: 'Prone', color: 'bg-amber-950 text-amber-300 border-amber-500' },
  { id: 'Stunned', label: 'Stunned', color: 'bg-purple-950 text-purple-300 border-purple-500' },
  { id: 'Blinded', label: 'Blinded', color: 'bg-stone-900 text-stone-300 border-stone-600' },
  { id: 'Frightened', label: 'Frightened', color: 'bg-red-950 text-red-300 border-red-500' }
];

export default function EncounterBar({
  monsters = [],
  turnOrder = [],
  currentTurnIndex = 0,
  player,
  companions = [],
  onExecuteCombatAction,
  activePosition = 'Engaged',
  onChangePosition,
  disabled = false
}) {
  const [selectedActionType, setSelectedActionType] = useState('action'); // 'action' | 'bonus' | 'movement'

  if (!monsters || monsters.length === 0) return null;

  const currentActor = turnOrder[currentTurnIndex] || turnOrder[0] || { name: player?.name || 'Player', isPlayer: true };

  // Class specific bonus actions
  const getBonusActionsForClass = (charClass) => {
    switch (charClass) {
      case 'Warrior':
        return [{ id: 'second_wind', name: 'Second Wind', desc: 'Regain 1d10+1 HP as a bonus action', icon: Heart }];
      case 'Rogue':
        return [{ id: 'cunning_action', name: 'Cunning Action', desc: 'Bonus action Dash or Disengage', icon: Wind }];
      case 'Cleric':
        return [{ id: 'healing_word', name: 'Healing Word', desc: 'Cast 1st level bonus healing (1d4+3 HP)', icon: Sparkles }];
      case 'Bard':
        return [{ id: 'bardic_inspire', name: 'Bardic Inspiration', desc: 'Grant +1d6 bonus die to an ally', icon: Zap }];
      default:
        return [{ id: 'potion_bonus', name: 'Quick Draught', desc: 'Quaff minor tincture in offhand', icon: Heart }];
    }
  };

  const bonusActions = getBonusActionsForClass(player?.class || 'Warrior');

  const handleActionClick = (actionName, desc) => {
    if (disabled) return;
    soundFx.playClick();
    soundFx.triggerSting('sword_clash');
    onExecuteCombatAction(`${actionName}: ${desc}`, 'combat');
  };

  return (
    <div className="w-full bg-stone-950/95 border-2 border-red-900/60 rounded-xl p-3 sm:p-4 shadow-2xl space-y-3 relative overflow-hidden animate-fade-in">
      {/* Red Combat Glow Backdrop */}
      <div className="absolute top-0 right-0 w-72 h-20 bg-red-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* 1. Initiative Turn Order Carousel Header */}
      <div className="flex items-center justify-between border-b border-red-900/40 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-950 border border-red-600/60">
            <Swords className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <span className="text-xs font-cinzel font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
              5e Initiative Order
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-900/50 text-red-200 border border-red-700 font-mono">
                Round Active
              </span>
            </span>
          </div>
        </div>

        {/* Turn Order Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
          {turnOrder.map((actor, idx) => {
            const isCurrent = idx === currentTurnIndex;
            return (
              <div
                key={`${actor.name}-${idx}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-cinzel transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-red-900 to-amber-900 text-amber-200 border border-amber-400 shadow-candle-sm scale-105'
                    : 'bg-stone-900/90 text-stone-400 border border-stone-800'
                }`}
              >
                <span className="font-mono text-[10px] text-amber-400/80">#{idx + 1}</span>
                <span className="font-bold truncate max-w-[90px]">{actor.name}</span>
                <span className="text-[10px] font-mono opacity-70">Init {actor.initiative || 12}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Monster Target Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {monsters.map((monster) => {
          const hpPercent = Math.max(0, Math.min(100, Math.round((monster.hp / monster.maxHp) * 100)));
          const isDead = monster.hp <= 0;

          return (
            <div
              key={monster.id || monster.name}
              className={`p-3 rounded-xl border transition-all ${
                isDead
                  ? 'bg-stone-900/40 border-stone-800 opacity-50'
                  : 'bg-stone-900/90 border-red-900/50 hover:border-red-500 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Skull className={`w-4 h-4 ${isDead ? 'text-stone-600' : 'text-red-400'}`} />
                  <span className="font-cinzel font-bold text-xs text-stone-200 truncate">
                    {monster.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[11px] font-mono text-amber-300">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>AC {monster.ac || 13}</span>
                </div>
              </div>

              {/* Monster HP Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-stone-400">
                  <span>Health</span>
                  <span>{monster.hp} / {monster.maxHp} HP</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${hpPercent > 50 ? 'bg-red-500' : 'bg-red-700'} transition-all duration-300`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
              </div>

              {/* Conditions / Weakness Badges */}
              {monster.conditions && monster.conditions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {monster.conditions.map(cond => (
                    <span key={cond} className="text-[9px] px-1.5 py-0.2 rounded border bg-red-950 text-red-300 border-red-800 font-cinzel">
                      {cond}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Action Economy & Combat Maneuvers */}
      <div className="pt-2 border-t border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Action / Bonus / Movement Mode Toggle */}
        <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800 w-full sm:w-auto">
          <button
            onClick={() => { soundFx.playClick(); setSelectedActionType('action'); }}
            className={`px-3 py-1 rounded text-xs font-cinzel font-bold transition-all ${
              selectedActionType === 'action'
                ? 'bg-red-800 text-amber-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Action (Main)
          </button>
          <button
            onClick={() => { soundFx.playClick(); setSelectedActionType('bonus'); }}
            className={`px-3 py-1 rounded text-xs font-cinzel font-bold transition-all ${
              selectedActionType === 'bonus'
                ? 'bg-amber-800 text-amber-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Bonus Action
          </button>
          <button
            onClick={() => { soundFx.playClick(); setSelectedActionType('movement'); }}
            className={`px-3 py-1 rounded text-xs font-cinzel font-bold transition-all ${
              selectedActionType === 'movement'
                ? 'bg-blue-900 text-blue-200 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Position: {activePosition}
          </button>
        </div>

        {/* Action Buttons Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-0.5">
          {selectedActionType === 'action' && (
            <>
              <button
                onClick={() => handleActionClick('Attack Action', 'Strike with primary weapon against enemy AC')}
                disabled={disabled}
                className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-600/70 text-red-200 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Crosshair className="w-3.5 h-3.5 text-red-400" />
                <span>Weapon Attack</span>
              </button>
              <button
                onClick={() => handleActionClick('Cast Spell', 'Cast an offensive or defensive cantrip/spell')}
                disabled={disabled}
                className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-600/70 text-purple-200 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Cast Spell</span>
              </button>
              <button
                onClick={() => handleActionClick('Dodge Action', 'Take defensive stance granting disadvantage to enemy attacks')}
                disabled={disabled}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Shield className="w-3.5 h-3.5 text-stone-400" />
                <span>Dodge</span>
              </button>
              <button
                onClick={() => handleActionClick('Dash Action', 'Double movement speed to maneuver across the battlefield')}
                disabled={disabled}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Wind className="w-3.5 h-3.5 text-stone-400" />
                <span>Dash</span>
              </button>
            </>
          )}

          {selectedActionType === 'bonus' && (
            <>
              {bonusActions.map(ba => {
                const Icon = ba.icon;
                return (
                  <button
                    key={ba.id}
                    onClick={() => handleActionClick(ba.name, ba.desc)}
                    disabled={disabled}
                    className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-600/70 text-amber-200 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{ba.name}</span>
                  </button>
                );
              })}
            </>
          )}

          {selectedActionType === 'movement' && (
            <>
              {['Engaged (Melee)', 'Near (30ft)', 'Far (60ft+)'].map(pos => {
                const isCurrent = activePosition === pos || activePosition.includes(pos.split(' ')[0]);
                return (
                  <button
                    key={pos}
                    onClick={() => {
                      if (onChangePosition) onChangePosition(pos);
                      handleActionClick('Tactical Shift', `Repositioned party to ${pos}`);
                    }}
                    disabled={disabled}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
                      isCurrent
                        ? 'bg-blue-900 text-blue-200 border-blue-400'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-700'
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                    <span>{pos}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
