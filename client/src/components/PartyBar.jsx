import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Skull, Flame, Sparkles, Wand2 } from 'lucide-react';
import PortraitDisplay from './PortraitDisplay';
import { getApprovalRating } from '../constants/companions';
import { soundFx } from '../services/audio';

export default function PartyBar({ player, companions = [], onUseTacticalSkill, onOpenCamp }) {
  if (!player) return null;

  return (
    <div className="w-full bg-tavern-wood/90 border border-tavern-amber/40 rounded-xl p-2 sm:p-2.5 shadow-md flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="text-[10px] font-cinzel text-tavern-gold/70 uppercase tracking-widest font-bold shrink-0 hidden md:inline">
          Party:
        </span>

        {/* 1. Player Card */}
        <div className="shrink-0 flex items-center gap-2 bg-tavern-darkest/90 border border-tavern-gold/60 rounded-lg px-2.5 py-1.5 shadow-sm min-w-[140px] sm:min-w-[155px]">
          <PortraitDisplay
            portraitUrl={player.portraitUrl}
            characterClass={player.class}
            name={player.name}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-cinzel font-bold text-xs text-tavern-glow truncate">{player.name}</span>
              <span className="text-[9px] px-1 rounded bg-tavern-umber text-tavern-gold font-cinzel uppercase font-bold">
                You
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-tavern-parchment/70 font-mono mt-0.5">
              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
              <span>{player.hp}/{player.maxHp} HP</span>
            </div>
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full ${player.hp > player.maxHp * 0.5 ? 'bg-emerald-500' : 'bg-red-500'} transition-all duration-300`}
                style={{ width: `${Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. AI Companions Cards */}
        {companions.map((comp) => {
          const isFallen = comp.hp <= 0;
          const hpPercent = Math.max(0, Math.min(100, Math.round((comp.hp / comp.maxHp) * 100)));
          const rating = getApprovalRating(comp.approval || 50);

          return (
            <div
              key={comp.id}
              className={`shrink-0 flex items-center gap-2 border rounded-lg px-2.5 py-1.5 shadow-sm min-w-[160px] sm:min-w-[185px] transition-all relative group ${
                isFallen
                  ? 'bg-stone-900/80 border-stone-700 opacity-60'
                  : 'bg-tavern-darkest/75 border-tavern-amber/40 hover:border-tavern-gold/60'
              }`}
            >
              <div className="relative">
                <PortraitDisplay
                  portraitUrl={comp.portraitUrl}
                  characterClass={comp.class}
                  name={comp.name}
                  size="sm"
                />
                {isFallen && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                    <Skull className="w-4 h-4 text-red-400" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-cinzel font-bold text-xs text-tavern-parchment truncate">{comp.name}</span>
                  <span className={`text-[9px] px-1 rounded bg-stone-900/90 font-cinzel font-bold border border-stone-700 ${rating.color}`} title={`Approval: ${comp.approval || 50}/100`}>
                    {rating.icon} {rating.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-tavern-gold/80 font-cinzel mt-0.5">
                  <span>{comp.class}</span>
                  {isFallen ? (
                    <span className="text-red-400 font-bold">Fallen</span>
                  ) : (
                    <span className="font-mono">{comp.hp}/{comp.maxHp} HP</span>
                  )}
                </div>

                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full ${isFallen ? 'bg-stone-600' : hpPercent > 50 ? 'bg-emerald-500' : 'bg-red-500'} transition-all duration-300`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>

                {/* Tactical Skill Quick Button */}
                {comp.tacticalSkill && !isFallen && onUseTacticalSkill && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onUseTacticalSkill(comp);
                    }}
                    className="mt-1 w-full py-0.5 px-1 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-[9px] font-cinzel text-amber-200 flex items-center justify-center gap-1 transition-all active:scale-95"
                    title={comp.tacticalSkill.description}
                  >
                    <span>{comp.tacticalSkill.icon}</span>
                    <span className="truncate">{comp.tacticalSkill.name} (+{comp.tacticalSkill.bonus})</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Campfire Rest Button */}
      {onOpenCamp && (
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenCamp();
          }}
          className="shrink-0 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 hover:brightness-110 border border-amber-500/60 text-amber-200 text-xs font-cinzel font-bold shadow-candle flex items-center gap-1.5 active:scale-95 transition-all"
          title="Take Short or Long Rest at Camp"
        >
          <Flame className="w-4 h-4 text-orange-400 animate-flicker" />
          <span className="hidden sm:inline">Camp & Rest</span>
        </button>
      )}
    </div>
  );
}

