import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Heart, Coins, Backpack, Sparkles, Wand2, Flame, Moon, ChevronDown, ChevronUp, Eye, Zap } from 'lucide-react';
import PortraitDisplay from './PortraitDisplay';
import { getStatModifier } from '../constants/archetypes';
import { useGame } from '../context/GameContext';
import { soundFx } from '../services/audio';

export default function CharacterSheet({ isCompact = false, onInspectItem }) {
  const { character, setCharacter, useItem, performCampRest } = useGame();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [showSpellbook, setShowSpellbook] = useState(false);
  const prevHpRef = useRef(character?.hp);
  const [hpFlash, setHpFlash] = useState(null);

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

  const isSpellcaster = ['Mage', 'Cleric', 'Bard'].includes(character.class);
  const hpPercent = Math.max(0, Math.min(100, Math.round((character.hp / character.maxHp) * 100)));
  const hpColor = hpPercent > 50 ? 'bg-emerald-600' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-600';

  // Spell Slots State
  const spellSlots = character.spellSlots || {
    level1: { total: 3, current: 3 },
    level2: { total: 2, current: 2 }
  };

  // Prepared Spells by Class
  const defaultPreparedSpells = {
    Mage: [
      { name: 'Magic Missile', level: 1, school: 'Evocation', time: '1 Action', range: '120 ft', desc: '3 darts deal 1d4+1 force damage each.' },
      { name: 'Shield', level: 1, school: 'Abjuration', time: '1 Reaction', range: 'Self', desc: '+5 AC until start of next turn.' },
      { name: 'Thunderwave', level: 1, school: 'Evocation', time: '1 Action', range: '15 ft cube', desc: '2d8 thunder damage & 10ft push on failed CON save.' },
      { name: 'Misty Step', level: 2, school: 'Conjuration', time: '1 Bonus Action', range: 'Self (30 ft)', desc: 'Teleport up to 30 feet to an unoccupied space.' }
    ],
    Cleric: [
      { name: 'Cure Wounds', level: 1, school: 'Evocation', time: '1 Action', range: 'Touch', desc: 'Touch creature regains 1d8 + WIS mod HP.' },
      { name: 'Healing Word', level: 1, school: 'Evocation', time: '1 Bonus Action', range: '60 ft', desc: 'Target regains 1d4 + WIS mod HP.' },
      { name: 'Guiding Bolt', level: 1, school: 'Evocation', time: '1 Action', range: '120 ft', desc: '4d6 radiant damage + grants advantage on next attack.' },
      { name: 'Spiritual Weapon', level: 2, school: 'Evocation', time: '1 Bonus Action', range: '60 ft', desc: 'Spectral weapon strikes for 1d8+WIS force damage.' }
    ],
    Bard: [
      { name: 'Vicious Mockery', level: 0, school: 'Enchantment', time: '1 Action', range: '60 ft', desc: '1d4 psychic damage + disadvantage on next attack roll.' },
      { name: 'Dissonant Whispers', level: 1, school: 'Enchantment', time: '1 Action', range: '60 ft', desc: '3d6 psychic damage + target uses reaction to flee.' },
      { name: 'Healing Word', level: 1, school: 'Evocation', time: '1 Bonus Action', range: '60 ft', desc: 'Target regains 1d4 + CHA mod HP.' },
      { name: 'Invisibility', level: 2, school: 'Illusion', time: '1 Action', range: 'Touch', desc: 'Target becomes invisible for up to 1 hour.' }
    ]
  };

  const spellsList = defaultPreparedSpells[character.class] || [];

  const handleCastSpell = (spell) => {
    if (spell.level === 0) {
      soundFx.playClick();
      soundFx.triggerSting('spell_cast');
      useItem(`Spell Cast: ${spell.name}`);
      return;
    }

    const slotKey = `level${spell.level}`;
    const available = spellSlots[slotKey]?.current || 0;

    if (available <= 0) {
      soundFx.playFailure();
      return;
    }

    soundFx.playClick();
    soundFx.triggerSting('spell_cast');

    const updatedSlots = {
      ...spellSlots,
      [slotKey]: {
        ...spellSlots[slotKey],
        current: available - 1
      }
    };

    setCharacter({ ...character, spellSlots: updatedSlots });
    useItem(`Spell Cast: ${spell.name} (Expended Level ${spell.level} Spell Slot)`);
  };

  const statsList = [
    { key: 'STR', label: 'Strength' },
    { key: 'DEX', label: 'Dexterity' },
    { key: 'CON', label: 'Constitution' },
    { key: 'INT', label: 'Intelligence' },
    { key: 'WIS', label: 'Wisdom' },
    { key: 'CHA', label: 'Charisma' }
  ];

  return (
    <div className={`relative w-full bg-black/45 backdrop-blur-xl border border-tavern-gold/25 rounded-2xl overflow-hidden shadow-2xl text-tavern-parchment transition-all duration-300 ${
      hpFlash === 'damage' ? 'ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : hpFlash === 'heal' ? 'ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]' : ''
    }`}>
      {/* 4 Ornate Gold Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tavern-glow pointer-events-none rounded-tl-sm z-20" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tavern-glow pointer-events-none rounded-tr-sm z-20" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-tavern-glow pointer-events-none rounded-bl-sm z-20" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-tavern-glow pointer-events-none rounded-br-sm z-20" />

      {/* Mobile Accordion Toggle */}
      <div
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="lg:hidden flex items-center justify-between p-3 bg-stone-900/80 border-b border-tavern-gold/20 cursor-pointer"
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
      <div className={`p-4 lg:block ${isOpenMobile ? 'block' : 'hidden'} space-y-4`}>
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
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-cinzel uppercase font-semibold bg-tavern-umber border border-tavern-amber text-tavern-gold">
                Level 1 {character.class}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-700">
                HD: 1d{character.class === 'Warrior' ? '10' : character.class === 'Mage' ? '6' : '8'}
              </span>
            </div>

            {/* HP Bar */}
            <div className="mt-1 relative">
              <div className="flex justify-between text-xs mb-1 font-cinzel">
                <span className="text-tavern-parchment/80 flex items-center gap-1">
                  <Heart className={`w-3.5 h-3.5 ${hpFlash === 'damage' ? 'text-red-500 animate-ping' : 'text-red-400 fill-red-400'}`} /> Health
                </span>
                <span className="font-bold text-tavern-parchment font-mono">
                  {character.hp} / {character.maxHp} HP
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
        <div className="pb-3 border-b border-tavern-amber/30">
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
                  <div className="text-sm font-bold text-tavern-parchment font-mono">{val}</div>
                  <div className="text-[10px] font-mono font-bold text-tavern-glow">{mod}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spellbook & Spell Slots Section (For Spellcasters) */}
        {isSpellcaster && (
          <div className="pb-3 border-b border-tavern-amber/30">
            <button
              onClick={() => setShowSpellbook(!showSpellbook)}
              className="w-full flex items-center justify-between text-[11px] font-cinzel uppercase tracking-wider text-purple-300 font-bold hover:text-purple-200"
            >
              <div className="flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Spellbook & Spell Slots</span>
              </div>
              {showSpellbook ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Spell Slot Dots */}
            <div className="flex items-center justify-between text-xs font-mono mt-2 bg-stone-950/70 p-2 rounded-lg border border-purple-900/40">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-purple-300 font-cinzel font-bold">Lvl 1 Slots:</span>
                <div className="flex gap-1">
                  {Array.from({ length: spellSlots.level1.total }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full border ${
                        i < spellSlots.level1.current
                          ? 'bg-purple-500 border-purple-300 shadow-[0_0_6px_#a855f7]'
                          : 'bg-stone-800 border-stone-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-purple-300 font-cinzel font-bold">Lvl 2 Slots:</span>
                <div className="flex gap-1">
                  {Array.from({ length: spellSlots.level2.total }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full border ${
                        i < spellSlots.level2.current
                          ? 'bg-indigo-500 border-indigo-300 shadow-[0_0_6px_#6366f1]'
                          : 'bg-stone-800 border-stone-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Expandable Spell List */}
            {showSpellbook && (
              <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {spellsList.map(spell => {
                  const slotKey = `level${spell.level}`;
                  const hasSlots = spell.level === 0 || (spellSlots[slotKey]?.current || 0) > 0;

                  return (
                    <div
                      key={spell.name}
                      className="p-2 rounded-lg bg-stone-950/80 border border-purple-900/40 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-cinzel font-bold text-purple-200 truncate">{spell.name}</span>
                          <span className="text-[9px] px-1 rounded bg-purple-950 text-purple-300 font-mono">
                            {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 font-sans truncate">{spell.desc}</p>
                      </div>
                      <button
                        onClick={() => handleCastSpell(spell)}
                        disabled={!hasSlots}
                        className="px-2 py-1 rounded bg-purple-900/80 hover:bg-purple-800 text-purple-100 text-[10px] font-cinzel font-bold border border-purple-600/60 shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0"
                      >
                        Cast
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Inventory Bag */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-cinzel uppercase tracking-wider text-tavern-gold/90 font-bold flex items-center gap-1.5">
              <Backpack className="w-3.5 h-3.5" /> Adventurer’s Pack
            </h4>
            <span className="text-[10px] text-tavern-parchment/60 font-mono">
              {(character.inventory || []).length} items
            </span>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {(character.inventory || []).map((item, idx) => {
              const isUsable = item.toLowerCase().includes('potion') || item.toLowerCase().includes('draught') || item.toLowerCase().includes('elixir');
              return (
                <div
                  key={`${item}-${idx}`}
                  className="flex items-center justify-between text-xs bg-tavern-darkest/60 border border-tavern-amber/20 hover:border-tavern-amber rounded-md px-2.5 py-1.5 transition-all group"
                >
                  <button
                    onClick={() => {
                      if (onInspectItem) onInspectItem(item);
                    }}
                    className="truncate text-tavern-parchment/90 hover:text-tavern-glow flex items-center gap-1.5 text-left"
                    title="Click to inspect item"
                  >
                    <Eye className="w-3 h-3 text-tavern-gold/60 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    <span className="truncate">{item}</span>
                  </button>
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

        {/* Short & Long Rest Quick Triggers */}
        <div className="pt-2 border-t border-tavern-amber/30 grid grid-cols-2 gap-2">
          <button
            onClick={() => performCampRest('short')}
            className="py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-tavern-amber/30 text-stone-300 hover:text-tavern-gold text-xs font-cinzel flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Short Rest</span>
          </button>
          <button
            onClick={() => performCampRest('long')}
            className="py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-tavern-amber/30 text-stone-300 hover:text-tavern-gold text-xs font-cinzel flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Moon className="w-3.5 h-3.5 text-blue-400" />
            <span>Long Rest</span>
          </button>
        </div>
      </div>
    </div>
  );
}
