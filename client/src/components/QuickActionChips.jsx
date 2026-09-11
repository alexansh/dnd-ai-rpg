import React, { useState } from 'react';
import { Send, Sparkles, Wand2, Shield, Eye, Footprints, MessageSquare } from 'lucide-react';
import { soundFx } from '../services/audio';

const DEFAULT_CHIPS = [
  { label: 'Attack / Strike', icon: Shield },
  { label: 'Investigate Area', icon: Eye },
  { label: 'Cast Spell', icon: Wand2 },
  { label: 'Attempt Diplomacy', icon: MessageSquare },
  { label: 'Flee to Safety', icon: Footprints }
];

export default function QuickActionChips({ onAction, dynamicChips = [], disabled = false }) {
  const [inputText, setInputText] = useState('');

  const chipsToDisplay = dynamicChips && dynamicChips.length > 0
    ? dynamicChips
    : DEFAULT_CHIPS.map(c => c.label);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || disabled) return;
    soundFx.playClick();
    onAction(inputText.trim(), 'custom');
    setInputText('');
  };

  const handleChipClick = (chipText) => {
    if (disabled) return;
    soundFx.playClick();
    onAction(chipText, 'quick');
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Quick Action Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-cinzel text-tavern-gold/70 uppercase tracking-wider font-bold shrink-0 hidden sm:inline">
          Actions:
        </span>
        {chipsToDisplay.map((chip, idx) => (
          <button
            key={`${chip}-${idx}`}
            onClick={() => handleChipClick(chip)}
            disabled={disabled}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-tavern-wood hover:bg-tavern-umber text-tavern-parchment hover:text-tavern-glow border border-tavern-amber/50 hover:border-tavern-gold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Freeform "What do you do?" input bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="What do you do? (e.g. Draw your sword, cast a spell, inspect the glyph...)"
          disabled={disabled}
          className="w-full pl-4 pr-12 py-3 bg-tavern-darkest/95 border-2 border-tavern-amber/60 rounded-xl text-tavern-parchment text-sm focus:border-tavern-glow focus:outline-none focus:ring-2 focus:ring-tavern-gold/30 shadow-inner placeholder:text-stone-500 font-sans"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || disabled}
          className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-tavern-amber to-tavern-gold text-tavern-darkest hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm"
          title="Send Action to Dungeon Master"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
