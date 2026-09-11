import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Heart, Coins, Backpack, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import PortraitDisplay from './PortraitDisplay';
import { getStatModifier } from '../constants/archetypes';
import { useGame } from '../context/GameContext';

export default function CharacterSheet({ isCompact = false }) {
  const { character, useItem } = useGame();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const prevHpRef = useRef(character?.hp);
  const [hpFlash, setHpFlash] = useState(null); // 'damage' | 'heal' | null

  useEffect(() => {
    if (!character) return;
    if (prevHpRef.current !== undefined && prevHpRef.current !== character.hp) {
      if (character.hp < prevHpRef.current) {
        setHpFlash('damage');
      } else if (character.hp > prevHpRef.current) {
        setHpFlash('heal');
      }
      const timer = setTimeout(() => setHpFlash(null), 800);
      prevHpRef.current = character.hp;
      return () => clearTimeout(timer);
    }
    prevHpRef.current = character.hp;
  }, [character?.hp]);

  if (!character) return null;

  const hpPercent = Math.max(0, Math.min(100, Math.round((character.hp / character.maxHp) * 100)));
  const hpColor = hpPercent > 50 ? 'bg-emerald-600' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-600';

  const statsList = [
    { key: 'STR', label: 'Strength' },
    { key: 'DEX', label: 'Dexterity' },
    { key: 'CON', label: 'Constitution' },
    { key: 'INT', label: 'Intelligence' },
    { key: 'WIS', label: 'Wisdom' },
    { key: 'CHA', label: 'Charisma' }
  ];

  return (
    <div className={`w-full bg-tavern-wood border border-tavern-gold/40 rounded-xl overflow-hidden shadow-parchment text-tavern-parchment transition-all duration-300 ${
      hpFlash === 'damage' ? 'ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : hpFlash === 'heal' ? 'ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]' : ''
    }`}>
      {/* Mobile Accordion Toggle */}
      <div
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="lg:hidden flex items-center justify-between p-3 bg-tavern-umber/80 border-b border-tavern-amber/40 cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <PortraitDisplay
            portraitUrl={character.portraitUrl}
            characterClass={character.class}
            name={character.name}
            size="sm"
          />
          <div>
            <h4 className="font-cinzel font-bold text-tavern-glow text-sm">{character.name}</h4>
            <p className="text-xs text-tavern-gold">{character.class} • HP: {character.hp}/{character.maxHp}</p>
          </div>
        </div>
        <button className="text-tavern-gold p-1">
          {isOpenMobile ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Sheet Content Body */}
      <div className={`p-4 lg:block ${isOpenMobile ? 'block' : 'hidden'}`}>
        {/* Top Header Card */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-tavern-amber/30">
          <PortraitDisplay
            portraitUrl={character.portraitUrl}
            characterClass={character.class}
            name={character.name}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-cinzel font-bold text-base sm:text-lg text-tavern-glow truncate">{character.name}</h3>
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-cinzel uppercase font-semibold bg-tavern-umber border border-tavern-amber text-tavern-gold mb-1.5">
              Level 1 {character.class}
            </span>

            {/* HP Bar with smooth animated width and status flash */}
            <div className="mt-1 relative">
              <div className="flex justify-between text-xs mb-1 font-cinzel">
                <span className="text-tavern-parchment/80 flex items-center gap-1">
                  <Heart className={`w-3.5 h-3.5 ${hpFlash === 'damage' ? 'text-red-500 animate-ping' : 'text-red-400 fill-red-400'}`} /> Health
                </span>
                <span className="font-bold text-tavern-parchment">
                  {character.hp} / {character.maxHp}
                </span>
              </div>
              <div className="w-full h-2.5 bg-tavern-darkest rounded-full overflow-hidden border border-stone-700/60 relative">
                <motion.div
                  initial={false}
                  animate={{ width: `${hpPercent}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full ${hpColor} rounded-full relative`}
                >
                  {hpFlash === 'heal' && (
                    <span className="absolute inset-0 bg-white/40 animate-pulse rounded-full" />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Gold Pouch */}
            <div className="flex items-center gap-1.5 mt-2 text-xs text-tavern-gold font-bold font-cinzel">
              <Coins className="w-3.5 h-3.5 text-tavern-glow" />
              <span>{character.gold} Gold Pieces</span>
            </div>
          </div>
        </div>

        {/* 6 Core Stats Grid */}
        <div className="py-4 border-b border-tavern-amber/30">
          <h4 className="text-[11px] font-cinzel uppercase tracking-wider text-tavern-gold/90 mb-2 font-bold">
            Ability Scores & Modifiers
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2">
            {statsList.map(({ key, label }) => {
              const val = character.stats?.[key] || 10;
              const mod = getStatModifier(val);
              return (
                <div
                  key={key}
                  title={label}
                  className="bg-tavern-darkest/70 border border-tavern-amber/30 rounded-lg p-1.5 text-center hover:border-tavern-gold transition-colors"
                >
                  <div className="text-[10px] font-cinzel text-tavern-gold/80 font-bold">{key}</div>
                  <div className="text-sm font-bold text-tavern-parchment">{val}</div>
                  <div className="text-[10px] font-mono font-bold text-tavern-glow">{mod}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Bag */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-cinzel uppercase tracking-wider text-tavern-gold/90 font-bold flex items-center gap-1.5">
              <Backpack className="w-3.5 h-3.5" /> Adventurer’s Pack
            </h4>
            <span className="text-[10px] text-tavern-parchment/60 font-mono">
              {(character.inventory || []).length} items
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {(character.inventory || []).map((item, idx) => {
              const isUsable = item.toLowerCase().includes('potion') || item.toLowerCase().includes('draught') || item.toLowerCase().includes('elixir');
              return (
                <div
                  key={`${item}-${idx}`}
                  className="flex items-center justify-between text-xs bg-tavern-darkest/60 border border-tavern-amber/20 hover:border-tavern-amber rounded-md px-2.5 py-1.5 transition-all"
                >
                  <span className="truncate text-tavern-parchment/90">{item}</span>
                  {isUsable ? (
                    <button
                      onClick={() => useItem(item)}
                      className="text-[10px] font-cinzel px-2 py-0.5 rounded bg-tavern-amber/60 hover:bg-tavern-amber text-tavern-glow font-bold border border-tavern-gold/50 shadow-sm active:scale-95 transition-all"
                    >
                      Use
                    </button>
                  ) : (
                    <span className="text-[10px] text-tavern-gold/50 font-cinzel">Equipped</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
