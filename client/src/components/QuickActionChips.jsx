import React, { useState } from 'react';
import { Send, Sword, MessageSquare, Feather, RotateCcw, Undo2, Sparkles } from 'lucide-react';
import { soundFx } from '../services/audio';

const DEFAULT_CHIPS = [
  { label: 'Attack / Strike', type: 'do' },
  { label: 'Investigate Area', type: 'do' },
  { label: 'Speak to Companion', type: 'say' },
  { label: 'Cast Cantrip / Spell', type: 'do' },
  { label: 'A sudden omen manifests', type: 'story' }
];

export default function QuickActionChips({
  onAction,
  dynamicChips = [],
  disabled = false,
  onUndo,
  onRetry,
  canUndo = false,
  canRetry = false
}) {
  const [actionMode, setActionMode] = useState('do'); // 'do' | 'say' | 'story'
  const [inputText, setInputText] = useState('');

  const chipsToDisplay = dynamicChips && dynamicChips.length > 0
    ? dynamicChips
    : DEFAULT_CHIPS.map(c => c.label);

  const getPlaceholder = () => {
    switch (actionMode) {
      case 'say':
        return 'What do you say? (e.g. "Barnaby, what is the word on the goblin raids?")';
      case 'story':
        return 'Guide the story/scene directly (e.g. A sudden thunderstorm breaks overhead as the bells toll...)';
      default:
        return 'What do you do? (e.g. Draw blade and kick open the sarcophagus...)';
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || disabled) return;
    soundFx.playClick();
    onAction(inputText.trim(), actionMode);
    setInputText('');
  };

  const handleChipClick = (chipText) => {
    if (disabled) return;
    soundFx.playClick();
    onAction(chipText, actionMode);
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Action Mode Toggle Bar & Director Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Do / Say / Story Mode Pills */}
        <div className="flex items-center gap-1 bg-tavern-darkest/90 p-1 rounded-xl border border-tavern-amber/40 shadow-inner">
          <button
            type="button"
            onClick={() => { soundFx.playClick(); setActionMode('do'); }}
            className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all ${
              actionMode === 'do'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 shadow-md scale-102 font-extrabold'
                : 'text-tavern-parchment/70 hover:text-tavern-glow hover:bg-tavern-wood/50'
            }`}
          >
            <Sword className="w-3.5 h-3.5" />
            <span>Do</span>
          </button>

          <button
            type="button"
            onClick={() => { soundFx.playClick(); setActionMode('say'); }}
            className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all ${
              actionMode === 'say'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 shadow-md scale-102 font-extrabold'
                : 'text-tavern-parchment/70 hover:text-tavern-glow hover:bg-tavern-wood/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Say</span>
          </button>

          <button
            type="button"
            onClick={() => { soundFx.playClick(); setActionMode('story'); }}
            className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all ${
              actionMode === 'story'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 shadow-md scale-102 font-extrabold'
                : 'text-tavern-parchment/70 hover:text-tavern-glow hover:bg-tavern-wood/50'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Story</span>
          </button>
        </div>

        {/* Director's Pen: Undo & Retry buttons */}
        <div className="flex items-center gap-1.5">
          {onUndo && (
            <button
              type="button"
              onClick={() => { soundFx.playClick(); onUndo(); }}
              disabled={!canUndo || disabled}
              className="p-1.5 px-2.5 rounded-lg bg-tavern-wood hover:bg-tavern-umber border border-tavern-amber/40 text-tavern-gold text-xs font-cinzel flex items-center gap-1 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm"
              title="Undo last turn & restore previous state"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={() => { soundFx.playClick(); onRetry(); }}
              disabled={!canRetry || disabled}
              className="p-1.5 px-2.5 rounded-lg bg-tavern-wood hover:bg-tavern-umber border border-tavern-amber/40 text-tavern-gold text-xs font-cinzel flex items-center gap-1 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm"
              title="Retry turn for a fresh DM narrative branch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Retry</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Action Chips Horizontal Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-cinzel text-tavern-gold/70 uppercase tracking-wider font-bold shrink-0 hidden sm:inline">
          Suggested:
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

      {/* Action Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-tavern-gold/60">
          {actionMode === 'do' && <Sword className="w-4 h-4" />}
          {actionMode === 'say' && <MessageSquare className="w-4 h-4" />}
          {actionMode === 'story' && <Feather className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className="w-full pl-10 pr-12 py-3 bg-tavern-darkest/95 border-2 border-tavern-amber/60 rounded-xl text-tavern-parchment text-sm focus:border-tavern-glow focus:outline-none focus:ring-2 focus:ring-tavern-gold/30 shadow-inner placeholder:text-stone-500 font-sans transition-all"
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
