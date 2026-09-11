import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Sword, Heart, Coins, X, Check, Award, Package } from 'lucide-react';
import { soundFx } from '../services/audio';

export default function LootCardModal({ isOpen, onClose, item, onUseItem }) {
  if (!isOpen || !item) return null;

  const getItemRarity = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('legendary') || n.includes('sovereign') || n.includes('dragon') || n.includes('flame tongue')) {
      return { label: 'Legendary', color: 'border-amber-400 text-amber-300 bg-amber-950/40 shadow-[0_0_20px_rgba(251,191,36,0.3)]' };
    }
    if (n.includes('very rare') || n.includes('crown') || n.includes('wand') || n.includes('astrolabe')) {
      return { label: 'Very Rare', color: 'border-purple-500 text-purple-300 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]' };
    }
    if (n.includes('rare') || n.includes('boots') || n.includes('cloak') || n.includes('ring')) {
      return { label: 'Rare', color: 'border-blue-500 text-blue-300 bg-blue-950/40 shadow-[0_0_15px_rgba(59,130,246,0.25)]' };
    }
    if (n.includes('uncommon') || n.includes('silver') || n.includes('potion') || n.includes('elixir')) {
      return { label: 'Uncommon', color: 'border-emerald-500 text-emerald-300 bg-emerald-950/40' };
    }
    return { label: 'Common', color: 'border-stone-500 text-stone-300 bg-stone-900/40' };
  };

  const itemName = typeof item === 'string' ? item : item.name || 'Adventurer Relic';
  const rarity = getItemRarity(itemName);
  const isConsumable = itemName.toLowerCase().includes('potion') || itemName.toLowerCase().includes('draught') || itemName.toLowerCase().includes('salve');

  const handleAction = () => {
    soundFx.playClick();
    if (onUseItem) onUseItem(itemName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md bg-stone-900 border-2 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-4 ${rarity.color}`}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-400/10 blur-2xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-tavern-amber/30 pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-tavern-glow" />
            <span className="text-xs font-cinzel font-bold tracking-widest uppercase text-tavern-gold">
              Item Dossier
            </span>
          </div>
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="text-center space-y-2 py-2">
          <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-cinzel uppercase font-bold border ${rarity.color}`}>
            {rarity.label} Relic
          </span>
          <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-tavern-glow">
            {itemName}
          </h3>
          <p className="text-xs text-tavern-parchment/80 font-serif italic max-w-sm mx-auto leading-relaxed">
            {isConsumable
              ? 'A glowing vial imbued with restorative vital essences. Quaffing immediately mends mortal wounds and staves off death.'
              : 'A prized heirloom recovered from the ancient halls of the realm. Carries intrinsic tactical advantages when borne into battle.'}
          </p>
        </div>

        {/* Property Specs */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-stone-950/70 p-3 rounded-xl border border-stone-800">
          <div className="text-left">
            <span className="text-stone-500 text-[10px] block font-cinzel">Item Category</span>
            <span className="text-stone-200">{isConsumable ? 'Consumable Potion' : 'Adventuring Gear'}</span>
          </div>
          <div className="text-right">
            <span className="text-stone-500 text-[10px] block font-cinzel">Attunement</span>
            <span className="text-amber-400">Attuned to Hero</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-tavern-amber to-tavern-gold text-tavern-darkest font-cinzel font-bold text-sm shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isConsumable ? (
            <>
              <Heart className="w-4 h-4" />
              <span>Quaff Potion (+10 HP)</span>
            </>
          ) : (
            <>
              <Sword className="w-4 h-4" />
              <span>Ready & Equip Item</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
