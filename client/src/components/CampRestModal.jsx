import React, { useState } from 'react';
import { Flame, Moon, Heart, Sparkles, MessageSquare, Shield, X, Check, ThumbsUp } from 'lucide-react';
import { soundFx } from '../services/audio';
import { getApprovalRating } from '../constants/companions';

export default function CampRestModal({ isOpen, onClose, party = [], onTakeRest, onCompanionTalk, playerCharacter }) {
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const [activeDialogue, setActiveDialogue] = useState(null);
  const [dialogueHistory, setDialogueHistory] = useState({});
  const [approvalToast, setApprovalToast] = useState(null);

  if (!isOpen) return null;

  const handleRest = (type) => {
    soundFx.playClick();
    soundFx.playSuccess(false);
    onTakeRest(type);
    setApprovalToast({
      title: type === 'long' ? 'Long Rest Completed' : 'Short Rest Completed',
      desc: type === 'long' ? 'All Party HP fully restored. Spells renewed.' : 'Party recovered 50% max HP.'
    });
    setTimeout(() => setApprovalToast(null), 3000);
  };

  const handlePromptSelect = (companion, conversation) => {
    soundFx.playClick();
    setActiveDialogue(conversation);
    setDialogueHistory(prev => ({
      ...prev,
      [`${companion.id}_${conversation.id}`]: true
    }));

    if (conversation.approvalChange && onCompanionTalk) {
      onCompanionTalk(companion.id, conversation.approvalChange);
      setApprovalToast({
        title: `${companion.name} Approves (+${conversation.approvalChange})`,
        desc: conversation.approvalFeedback || 'Approval improved.'
      });
      setTimeout(() => setApprovalToast(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-stone-900/95 border-2 border-amber-600/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Floating Approval / Rest Toast */}
        {approvalToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-950/95 border border-amber-400 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce text-xs">
            <ThumbsUp className="w-4 h-4 text-amber-300" />
            <div>
              <span className="font-cinzel font-bold text-amber-300 block">{approvalToast.title}</span>
              <span className="text-stone-300 text-[11px] font-sans">{approvalToast.desc}</span>
            </div>
          </div>
        )}

        {/* Campfire Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-gradient-to-r from-stone-950 via-amber-950/60 to-stone-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-900/40 border border-amber-500/50 shadow-candle">
              <Flame className="w-6 h-6 text-orange-400 animate-flicker" />
            </div>
            <div>
              <h2 className="text-xl font-cinzel font-bold text-amber-200">
                Party Campfire & Long Rest
              </h2>
              <p className="text-xs text-amber-100/70 font-sans">
                Trek into camp to tend wounds, talk with your companions, and restore your strength
              </p>
            </div>
          </div>
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camp Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-y-auto flex-1">
          {/* Left: Party Member Camp Roster */}
          <div className="md:col-span-4 p-4 border-r border-amber-900/30 bg-stone-950/50 space-y-3">
            <span className="text-xs font-cinzel font-bold text-amber-400 uppercase tracking-wider block">
              Companions by the Hearth
            </span>

            {party.length === 0 ? (
              <p className="text-xs text-stone-400 italic p-3 bg-stone-900/60 rounded-lg">
                No companions in party yet. Explore the world or tavern to recruit allies!
              </p>
            ) : (
              party.map((companion) => {
                const isSelected = selectedCompanion?.id === companion.id;
                const rating = getApprovalRating(companion.approval || 50);

                return (
                  <button
                    key={companion.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedCompanion(companion);
                      setActiveDialogue(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400/50 shadow-candle'
                        : 'bg-stone-900/60 border-stone-800 hover:border-amber-700/60 hover:bg-stone-850'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-500/40 flex-shrink-0">
                      <img src={companion.portraitUrl} alt={companion.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-cinzel font-bold text-amber-100 block truncate">
                        {companion.name}
                      </span>
                      <span className="text-[10px] text-stone-400 block truncate font-sans">
                        {companion.role || companion.class}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px]">{rating.icon}</span>
                        <span className={`text-[10px] font-cinzel ${rating.color}`}>
                          {rating.label} ({companion.approval || 50})
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}

            {/* Rest & Camp Actions */}
            <div className="pt-3 border-t border-amber-900/30 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    soundFx.playSuccess(false);
                    if (onTakeRest) onTakeRest('short');
                    setApprovalToast({
                      title: 'Hearty Rations Cooked',
                      desc: '+5 Temporary Vitality granted to entire party.'
                    });
                    setTimeout(() => setApprovalToast(null), 3000);
                  }}
                  className="py-2 px-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500/50 text-[11px] font-cinzel font-bold text-amber-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Cook Rations (+5 HP)</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    soundFx.triggerSting('stealth_whisper');
                    setApprovalToast({
                      title: 'Camp Watch Established',
                      desc: 'Night perimeter secured; ambushes averted.'
                    });
                    setTimeout(() => setApprovalToast(null), 3000);
                  }}
                  className="py-2 px-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-blue-500/50 text-[11px] font-cinzel font-bold text-blue-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Keep Watch</span>
                </button>
              </div>

              <button
                onClick={() => handleRest('short')}
                className="w-full py-2.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500/50 text-xs font-cinzel font-bold text-stone-200 flex items-center justify-center gap-2 transition-all"
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Short Rest (Recover 50% HP)</span>
              </button>

              <button
                onClick={() => handleRest('long')}
                className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 hover:brightness-110 text-xs font-cinzel font-bold text-stone-950 flex items-center justify-center gap-2 shadow-candle transition-all"
              >
                <Moon className="w-4 h-4 text-stone-950" />
                <span>Take Long Rest (Full Restore)</span>
              </button>
            </div>
          </div>

          {/* Right: Companion 1-on-1 Dialogue & Persona */}
          <div className="md:col-span-8 p-6 flex flex-col justify-between bg-gradient-to-b from-stone-900/80 via-stone-900/95 to-stone-950 space-y-4">
            {selectedCompanion ? (
              <div className="space-y-4">
                {/* Companion Header Banner */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-stone-950/70 border border-amber-900/40">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-500/50 flex-shrink-0">
                    <img src={selectedCompanion.portraitUrl} alt={selectedCompanion.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-cinzel font-bold text-base text-amber-200">
                      {selectedCompanion.name}
                    </h3>
                    <p className="text-xs text-amber-400/90 font-cinzel">
                      {selectedCompanion.role}
                    </p>
                    <p className="text-[11px] text-stone-300 mt-1 italic font-serif">
                      "{selectedCompanion.personality?.trait || 'Watching the campfire flames in quiet contemplation.'}"
                    </p>
                  </div>
                </div>

                {/* Conversation Choices */}
                <div className="space-y-2">
                  <span className="text-xs font-cinzel font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    Speak with {selectedCompanion.name.split(' ')[0]}
                  </span>

                  <div className="space-y-2">
                    {(selectedCompanion.campConversations || []).map((conv) => {
                      const isRead = dialogueHistory[`${selectedCompanion.id}_${conv.id}`];
                      return (
                        <button
                          key={conv.id}
                          onClick={() => handlePromptSelect(selectedCompanion, conv)}
                          className={`w-full text-left p-3 rounded-lg border text-xs font-serif transition-all flex items-center justify-between ${
                            activeDialogue?.id === conv.id
                              ? 'bg-amber-950/80 border-amber-400 text-amber-100 ring-1 ring-amber-400/40'
                              : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-amber-600/50 hover:bg-stone-900'
                          }`}
                        >
                          <span className={isRead ? 'text-stone-400' : 'text-amber-200 font-medium'}>
                            {conv.prompt}
                          </span>
                          {isRead && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Dialogue Response Box */}
                {activeDialogue && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2 animate-fade-in">
                    <span className="text-[10px] font-cinzel uppercase tracking-widest text-amber-400 block font-bold">
                      {selectedCompanion.name} responds:
                    </span>
                    <p className="text-xs text-amber-100/95 font-serif italic leading-relaxed">
                      {activeDialogue.response}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <Flame className="w-12 h-12 text-amber-500/60 animate-flicker" />
                <h4 className="font-cinzel font-bold text-base text-amber-200">
                  The Hearth Beckons
                </h4>
                <p className="text-xs text-stone-400 max-w-sm font-sans">
                  Select a companion from the roster to engage in dialogue, deepen your bond, and uncover their secrets.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-amber-900/30">
              <button
                onClick={() => { soundFx.playClick(); onClose(); }}
                className="py-2.5 px-5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-cinzel text-xs font-bold border border-stone-600 transition-colors"
              >
                Return to Adventure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
