import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Scroll, Sparkles, Sword, MessageSquare, Feather, BookOpen, ChevronDown, ChevronUp, UserCheck, Shield, Edit3, Check, X, Volume2, VolumeX } from 'lucide-react';
import TypewriterText from './TypewriterText';
import { voiceEngine } from '../services/voiceEngine';
import { soundFx } from '../services/audio';

export default function NarrativeLog({
  log = [],
  storySummary = '',
  isLoading = false,
  onEditMessage
}) {
  const messagesEndRef = useRef(null);
  const [showSummary, setShowSummary] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [speakingId, setSpeakingId] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log, isLoading]);

  const handleStartEdit = (entry) => {
    soundFx.playClick();
    setEditingId(entry.id);
    setEditText(entry.content);
  };

  const handleSaveEdit = (id) => {
    soundFx.playClick();
    if (onEditMessage && editText.trim()) {
      onEditMessage(id, editText.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    soundFx.playClick();
    setEditingId(null);
  };

  const handleSpeakText = (entry) => {
    soundFx.playClick();
    if (speakingId === entry.id) {
      voiceEngine.stop();
      setSpeakingId(null);
    } else {
      setSpeakingId(entry.id);
      voiceEngine.speak(entry.content, null, () => setSpeakingId(null));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-tavern-darkest/90 border border-tavern-amber/40 rounded-xl shadow-2xl relative">
      {/* Story Summary Accordion Header */}
      {storySummary && (
        <div className="border-b border-tavern-amber/30 bg-tavern-wood/70 text-xs shrink-0">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="w-full flex items-center justify-between px-4 py-2 text-tavern-gold font-cinzel hover:bg-tavern-umber/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-tavern-glow" />
              <span>Chronicle So Far</span>
            </div>
            {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showSummary && (
            <div className="px-4 py-2.5 bg-tavern-darkest/80 text-tavern-parchment/80 italic text-xs border-t border-tavern-amber/20 font-serif leading-relaxed">
              "{storySummary}"
            </div>
          )}
        </div>
      )}

      {/* Narrative Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {log.map((entry, idx) => {
          const isLatest = idx === log.length - 1;
          const isEditing = editingId === entry.id;

          // 1. DM Narration Beat
          if (entry.role === 'dm') {
            return (
              <motion.div
                key={entry.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="bg-tavern-wood/80 border-l-4 border-tavern-gold rounded-r-lg p-4 sm:p-5 shadow-candle relative overflow-hidden group"
              >
                <div className="flex items-center justify-between text-xs font-cinzel font-bold text-tavern-gold mb-1.5 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Scroll className="w-3.5 h-3.5 text-tavern-glow" />
                    <span>Dungeon Master</span>
                    <span className="text-[10px] text-tavern-parchment/50 font-sans ml-2">{entry.timestamp}</span>
                  </div>

                  {/* Director Tools: Audio TTS button & Edit Pen */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleSpeakText(entry)}
                      className="p-1 rounded text-tavern-gold/70 hover:text-tavern-glow hover:bg-tavern-umber/60"
                      title={speakingId === entry.id ? 'Stop Voice Narration' : 'Listen with AI Voice'}
                    >
                      {speakingId === entry.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {onEditMessage && !isEditing && (
                      <button
                        onClick={() => handleStartEdit(entry)}
                        className="p-1 rounded text-tavern-gold/70 hover:text-tavern-glow hover:bg-tavern-umber/60"
                        title="Edit narration inline (Director's Pen)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body: Editing Mode vs Normal Display */}
                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-stone-900 border border-tavern-gold rounded-lg text-tavern-parchment text-sm font-sans focus:outline-none focus:ring-1 focus:ring-tavern-gold"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-2.5 py-1 rounded bg-stone-800 text-stone-300 text-xs font-cinzel hover:bg-stone-700 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(entry.id)}
                        className="px-3 py-1 rounded bg-tavern-gold text-tavern-darkest text-xs font-cinzel font-bold hover:brightness-110 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-tavern-parchment text-sm sm:text-base leading-relaxed font-sans font-normal">
                    {isLatest ? (
                      <TypewriterText text={entry.content} speed={14} />
                    ) : (
                      entry.content
                    )}
                  </div>
                )}
              </motion.div>
            );
          }

          // 2. Companion Action & Dialogue
          if (entry.role === 'companion') {
            const charColor = entry.companionColor || '#d4a574';
            return (
              <motion.div
                key={entry.id || idx}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ borderColor: charColor }}
                className="bg-tavern-darkest/90 border-l-4 rounded-r-xl p-3.5 sm:p-4 shadow-md space-y-1.5"
              >
                <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-tavern-glow">
                  <UserCheck className="w-3.5 h-3.5 text-tavern-gold" />
                  <span>{entry.companionName || 'Ally'}</span>
                  <span className="text-[10px] text-tavern-gold/70 px-1.5 py-0.2 rounded bg-tavern-umber/60 border border-tavern-amber/30">
                    {entry.companionClass || 'Companion'}
                  </span>
                  <span className="text-[10px] text-tavern-parchment/50 font-sans ml-auto">{entry.timestamp}</span>
                </div>
                <p className="text-tavern-parchment text-xs sm:text-sm leading-relaxed">
                  {entry.content}
                </p>
                {entry.dialogue && (
                  <p className="text-tavern-glow/90 italic text-xs font-serif pl-2 border-l border-tavern-gold/40">
                    "{entry.dialogue}"
                  </p>
                )}
              </motion.div>
            );
          }

          // 3. Player Action with Action Mode Styling
          if (entry.role === 'user') {
            const mode = entry.actionMode || 'do';
            return (
              <motion.div
                key={entry.id || idx}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`ml-auto max-w-[85%] border rounded-l-xl rounded-tr-xl p-3 sm:p-4 text-right shadow-md ${
                  mode === 'say'
                    ? 'bg-amber-950/90 border-amber-600/50'
                    : mode === 'story'
                    ? 'bg-purple-950/90 border-purple-600/50'
                    : 'bg-tavern-umber/90 border-tavern-gold/40'
                }`}
              >
                <div className="flex items-center justify-end gap-1.5 text-xs font-cinzel text-tavern-glow mb-1">
                  <span className="text-[10px] text-tavern-parchment/50 font-sans mr-auto">{entry.timestamp}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-tavern-darkest text-tavern-gold uppercase font-mono">
                    {mode}
                  </span>
                  {mode === 'say' ? (
                    <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                  ) : mode === 'story' ? (
                    <Feather className="w-3.5 h-3.5 text-purple-300" />
                  ) : (
                    <Sword className="w-3.5 h-3.5 text-tavern-gold" />
                  )}
                  <span className="font-bold">You</span>
                </div>
                <p className={`text-tavern-parchment text-sm leading-snug ${
                  mode === 'say' ? 'italic font-serif' : mode === 'story' ? 'font-serif text-purple-200' : 'font-sans'
                }`}>
                  {mode === 'say' ? `"${entry.content}"` : entry.content}
                </p>
              </motion.div>
            );
          }

          // 4. System / Dice / Item Notice
          return (
            <motion.div
              key={entry.id || idx}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 260, damping: 20 }}
              className="mx-auto max-w-lg bg-tavern-darkest/95 border border-tavern-amber/40 rounded-xl px-4 py-2.5 text-center text-xs font-cinzel text-tavern-gold shadow-md"
            >
              {entry.content}
            </motion.div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-tavern-wood/60 border-l-4 border-tavern-amber/60 rounded-r-lg p-4 flex items-center gap-3 animate-pulse"
          >
            <Sparkles className="w-4 h-4 text-tavern-glow animate-spin" />
            <span className="text-xs font-cinzel text-tavern-gold italic">
              The Dungeon Master is weaving the next beat of fate...
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
