import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MapPin, Users, Shield, Sparkles, Skull, Lock, Search, X, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../services/audio';

const CATEGORIES = [
  { id: 'All', label: 'All Lore', icon: BookOpen },
  { id: 'Locations', label: 'Locations', icon: MapPin },
  { id: 'NPCs', label: 'NPCs', icon: Users },
  { id: 'Factions', label: 'Factions', icon: Shield },
  { id: 'Relics', label: 'Relics', icon: Sparkles },
  { id: 'Monsters', label: 'Monsters', icon: Skull }
];

export default function CodexModal({ isOpen, onClose, codexEntries = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEntry, setActiveEntry] = useState(null);

  if (!isOpen) return null;

  const filteredEntries = codexEntries.filter(entry => {
    const matchesCat = selectedCategory === 'All' || entry.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.keywords || []).some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const discoveredCount = codexEntries.filter(e => e.discovered).length;
  const totalCount = codexEntries.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-stone-900/95 border-2 border-tavern-gold/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tavern-amber/40 bg-gradient-to-r from-stone-950 via-tavern-wood/90 to-stone-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-tavern-amber/30 border border-tavern-gold/60 shadow-candle">
              <BookOpen className="w-6 h-6 text-tavern-glow" />
            </div>
            <div>
              <h2 className="text-xl font-cinzel font-bold text-tavern-glow">
                World Codex & Lorebook
              </h2>
              <p className="text-xs text-tavern-parchment/70 font-sans">
                Persistent chronicles, discovered entities, and regional knowledge ({discoveredCount}/{totalCount} Discovered)
              </p>
            </div>
          </div>
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-1.5 rounded-lg text-tavern-parchment/60 hover:text-tavern-glow hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-tavern-amber/30 bg-stone-950/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { soundFx.playClick(); setSelectedCategory(cat.id); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    isSelected
                      ? 'bg-tavern-gold text-tavern-darkest shadow-md'
                      : 'bg-tavern-wood text-tavern-parchment/80 hover:text-tavern-glow hover:bg-tavern-umber border border-tavern-amber/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-tavern-gold/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search codex..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-tavern-amber/40 rounded-lg text-xs text-tavern-parchment placeholder:text-stone-500 focus:outline-none focus:border-tavern-glow"
            />
          </div>
        </div>

        {/* Codex Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
          {/* List Pane */}
          <div className="md:col-span-5 p-4 border-r border-tavern-amber/30 bg-stone-950/40 space-y-2.5 overflow-y-auto max-h-[55vh] md:max-h-full">
            {filteredEntries.length === 0 ? (
              <p className="text-xs text-stone-400 italic p-4 text-center">
                No lore entries found matching criteria.
              </p>
            ) : (
              filteredEntries.map(entry => {
                const isSelected = activeEntry?.id === entry.id;
                const isDiscovered = entry.discovered;

                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      if (isDiscovered) {
                        soundFx.playClick();
                        setActiveEntry(entry);
                      }
                    }}
                    disabled={!isDiscovered}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      !isDiscovered
                        ? 'bg-stone-900/40 border-stone-800 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-tavern-wood border-tavern-gold shadow-candle-sm ring-1 ring-tavern-gold/50'
                        : 'bg-stone-900/80 border-tavern-amber/30 hover:border-tavern-gold/60 hover:bg-tavern-umber/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-cinzel font-bold px-1.5 py-0.5 rounded bg-tavern-darkest text-tavern-gold border border-tavern-amber/30">
                        {entry.category}
                      </span>
                      {isDiscovered ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-stone-500" />
                      )}
                    </div>
                    <h4 className={`font-cinzel font-bold text-sm mt-1.5 truncate ${
                      isDiscovered ? 'text-tavern-glow' : 'text-stone-500'
                    }`}>
                      {isDiscovered ? entry.title : '??? [Undiscovered Lore]'}
                    </h4>
                    <p className="text-xs text-tavern-parchment/60 font-sans line-clamp-1 mt-0.5">
                      {isDiscovered ? entry.description : 'Explore the realm and engage in dialogue to reveal this entry.'}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Details Pane */}
          <div className="md:col-span-7 p-6 bg-stone-950/80 flex flex-col justify-between overflow-y-auto">
            {activeEntry ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-tavern-amber/30">
                  <span className="text-xs font-cinzel uppercase font-bold text-tavern-gold tracking-widest px-2.5 py-1 rounded bg-tavern-umber border border-tavern-amber/40">
                    {activeEntry.category} Entry
                  </span>
                  <span className="text-[11px] text-emerald-400 font-cinzel font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Logged in Codex
                  </span>
                </div>

                <h3 className="text-2xl font-cinzel font-bold text-tavern-glow">
                  {activeEntry.title}
                </h3>

                <div className="p-4 rounded-xl bg-tavern-wood/70 border border-tavern-amber/30 shadow-inner">
                  <p className="text-sm text-tavern-parchment font-serif leading-relaxed italic">
                    "{activeEntry.description}"
                  </p>
                </div>

                {activeEntry.keywords && (
                  <div>
                    <span className="text-[11px] font-cinzel text-tavern-gold/80 block mb-1 font-bold">
                      Associated Clues & Keywords:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeEntry.keywords.map(kw => (
                        <span key={kw} className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-tavern-parchment/80">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
                <BookOpen className="w-12 h-12 text-tavern-amber/40 mb-3" />
                <h4 className="font-cinzel font-bold text-tavern-gold text-base">Select a Codex Entry</h4>
                <p className="text-xs text-tavern-parchment/60 max-w-sm mt-1 font-sans">
                  Click any discovered location, NPC, faction, relic, or monster on the left to read detailed world lore.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
