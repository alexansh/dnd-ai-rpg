import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Scroll, Sparkles, Sword, BookOpen, ChevronDown, ChevronUp, UserCheck, Shield } from 'lucide-react';
import TypewriterText from './TypewriterText';

export default function NarrativeLog({ log = [], storySummary = '', isLoading = false }) {
  const messagesEndRef = useRef(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log, isLoading]);

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

          // 1. DM Narration Beat
          if (entry.role === 'dm') {
            return (
              <motion.div
                key={entry.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="bg-tavern-wood/80 border-l-4 border-tavern-gold rounded-r-lg p-4 sm:p-5 shadow-candle relative overflow-hidden"
              >
                <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-tavern-gold mb-1.5 uppercase tracking-wider">
                  <Scroll className="w-3.5 h-3.5 text-tavern-glow" />
                  <span>Dungeon Master</span>
                  <span className="text-[10px] text-tavern-parchment/50 font-sans ml-auto">{entry.timestamp}</span>
                </div>
                <div className="text-tavern-parchment text-sm sm:text-base leading-relaxed font-sans font-normal">
                  {isLatest ? (
                    <TypewriterText text={entry.content} speed={14} />
                  ) : (
                    entry.content
                  )}
                </div>
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

          // 3. Player Action
          if (entry.role === 'user') {
            return (
              <motion.div
                key={entry.id || idx}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="ml-auto max-w-[85%] bg-tavern-umber/90 border border-tavern-gold/40 rounded-l-xl rounded-tr-xl p-3 sm:p-4 text-right shadow-md"
              >
                <div className="flex items-center justify-end gap-1.5 text-xs font-cinzel text-tavern-glow mb-1">
                  <span className="text-[10px] text-tavern-parchment/50 font-sans mr-auto">{entry.timestamp}</span>
                  <Sword className="w-3.5 h-3.5" />
                  <span className="font-bold">You</span>
                </div>
                <p className="text-tavern-parchment text-sm leading-snug">
                  "{entry.content}"
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

        {/* Loading / DM thinking indicator */}
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
