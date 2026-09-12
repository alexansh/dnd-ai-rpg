import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Shield, Sparkles, Sword, MessageSquare, Feather, Coins, Zap, HelpCircle, Undo2, RotateCcw, AlertTriangle } from 'lucide-react';
import { soundFx } from '../services/audio';

const ICON_MAP = {
  Shield: Shield,
  Sparkles: Sparkles,
  Sword: Sword,
  MessageSquare: MessageSquare,
  Feather: Feather,
  Coins: Coins,
  Zap: Zap
};

export default function DecisionMatrix({
  fixedChoices = [],
  dynamicActions = [],
  onSelectChoice,
  onFreeformSubmit,
  onUndo,
  onRetry,
  canUndo = false,
  canRetry = false,
  disabled = false,
  party = []
}) {
  const [actionMode, setActionMode] = useState('do'); // 'do' | 'say' | 'story'
  const [freeformText, setFreeformText] = useState('');

  const handleChoiceClick = (choice) => {
    if (disabled) return;
    soundFx.playClick();
    if (choice.type === 'check') {
      soundFx.triggerSting('secret_found');
    }
    if (onSelectChoice) onSelectChoice(choice);
  };

  const handleFreeformSubmit = (e) => {
    e?.preventDefault();
    if (!freeformText.trim() || disabled) return;
    soundFx.playClick();
    if (onFreeformSubmit) onFreeformSubmit(freeformText.trim(), actionMode);
    setFreeformText('');
  };

  return (
    <div className="w-full space-y-3 bg-stone-950/95 border-2 border-tavern-amber/60 rounded-2xl p-4 shadow-2xl relative">
      {/* 1. Top Mode Selector & Director Tools */}
      <div className="flex items-center justify-between gap-2 border-b border-tavern-amber/30 pb-2.5">
        <div className="flex items-center gap-1 bg-tavern-darkest p-1 rounded-xl border border-tavern-amber/40 shadow-inner">
          <button
            type="button"
            onClick={() => { soundFx.playClick(); setActionMode('do'); }}
            className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all ${
              actionMode === 'do'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 shadow-md font-extrabold scale-102'
                : 'text-tavern-parchment/70 hover:text-tavern-glow'
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
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 shadow-md font-extrabold scale-102'
                : 'text-tavern-parchment/70 hover:text-tavern-glow'
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
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 shadow-md font-extrabold scale-102'
                : 'text-tavern-parchment/70 hover:text-tavern-glow'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Story</span>
          </button>
        </div>

        {/* Director Controls (Undo & Retry) */}
        <div className="flex items-center gap-1.5">
          {onUndo && (
            <button
              type="button"
              onClick={() => { soundFx.playClick(); onUndo(); }}
              disabled={!canUndo || disabled}
              className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-tavern-gold text-xs font-cinzel flex items-center gap-1 disabled:opacity-30"
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
              className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-tavern-gold text-xs font-cinzel flex items-center gap-1 disabled:opacity-30"
              title="Retry turn for alternative DM branch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Retry</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Structured Decision Choices (BG3 / Disco Elysium Style Cards) */}
      {fixedChoices && fixedChoices.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-cinzel font-bold uppercase tracking-widest text-tavern-gold block">
            Encounter Choices & Skill Checks:
          </span>

          <div className="grid grid-cols-1 gap-2">
            {fixedChoices.map((choice) => {
              const Icon = ICON_MAP[choice.icon] || Sword;
              const isCheck = choice.type === 'check' || choice.checkAbility;

              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceClick(choice)}
                  disabled={disabled}
                  className="w-full text-left p-3 rounded-xl border border-tavern-amber/40 hover:border-tavern-gold bg-stone-900/90 hover:bg-tavern-wood/70 transition-all flex items-center justify-between gap-3 group/choice shadow-md active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                      isCheck
                        ? 'bg-purple-950/80 border-purple-500/60 text-purple-300'
                        : 'bg-tavern-darkest border-tavern-gold/50 text-tavern-gold'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-cinzel font-bold text-xs sm:text-sm text-tavern-glow group-hover/choice:text-yellow-300 transition-colors">
                          {choice.label}
                        </span>

                        {isCheck && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700 font-mono font-bold">
                            {choice.checkAbility} Check (DC {choice.checkDc || 12})
                          </span>
                        )}
                      </div>

                      {choice.description && (
                        <p className="text-[11px] text-stone-400 font-sans mt-0.5 line-clamp-1">
                          {choice.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Predicted Companion Reactions */}
                  {choice.companionAffinities && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {Object.entries(choice.companionAffinities).map(([compId, val]) => (
                        <span
                          key={compId}
                          className={`text-[9px] font-cinzel font-bold px-1.5 py-0.5 rounded border ${
                            val > 0
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-red-950 text-red-300 border-red-700'
                          }`}
                          title={`${compId} approval shift`}
                        >
                          {val > 0 ? `+${val}` : val}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Contextual Quick Actions */}
      {dynamicActions && dynamicActions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-cinzel text-tavern-gold/80 uppercase tracking-wider font-bold shrink-0">
            Tactical Moves:
          </span>
          {dynamicActions.map((act, i) => (
            <button
              key={`${act}-${i}`}
              onClick={() => {
                soundFx.playClick();
                if (onFreeformSubmit) onFreeformSubmit(act, actionMode);
              }}
              disabled={disabled}
              className="shrink-0 text-xs px-3 py-1 rounded-full bg-tavern-wood hover:bg-tavern-umber text-tavern-parchment hover:text-tavern-glow border border-tavern-amber/40 shadow-sm active:scale-95 disabled:opacity-50"
            >
              {act}
            </button>
          ))}
        </div>
      )}

      {/* 4. Freeform Input Form */}
      <form onSubmit={handleFreeformSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-tavern-gold/60">
          {actionMode === 'do' && <Sword className="w-4 h-4" />}
          {actionMode === 'say' && <MessageSquare className="w-4 h-4" />}
          {actionMode === 'story' && <Feather className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={freeformText}
          onChange={(e) => setFreeformText(e.target.value)}
          placeholder={
            actionMode === 'say'
              ? 'Speak in dialogue (e.g. "Stand down, Inquisitor. This blood will not be spilled today.")'
              : actionMode === 'story'
              ? 'Direct narrative event (e.g. A bolt of lightning strikes the gibbet, illuminating Vance\'s armor)'
              : 'Direct physical action (e.g. Draw greatsword and assume defensive posture over Corvin)'
          }
          disabled={disabled}
          className="w-full pl-10 pr-12 py-3 bg-stone-900/95 border-2 border-tavern-amber/60 rounded-xl text-tavern-parchment text-sm focus:border-tavern-glow focus:outline-none focus:ring-2 focus:ring-tavern-gold/30 shadow-inner placeholder:text-stone-500 font-sans"
        />
        <button
          type="submit"
          disabled={!freeformText.trim() || disabled}
          className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-tavern-amber to-tavern-gold text-stone-950 hover:brightness-110 active:scale-95 disabled:opacity-40 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
