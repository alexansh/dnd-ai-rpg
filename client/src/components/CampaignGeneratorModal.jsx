import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Scroll, Compass, X, Check, Flame } from 'lucide-react';
import { soundFx } from '../services/audio';
import { generateCustomCampaign } from '../services/api';

const THEMES = [
  { id: 'Dungeon Crawl', label: 'Dungeon Vault Crawl', desc: 'Ancient crypts, traps, and forgotten treasures' },
  { id: 'Forest Expedition', label: 'Wilderness Expedition', desc: 'Bioluminescent groves, beast tracks, and fey magic' },
  { id: 'Urban Mystery', label: 'City Intrigue & Heist', desc: 'Marketplace conspiracies, stolen seals, and shady parleys' },
  { id: 'Coastal Raid', label: 'Coastal Sea Cavern', desc: 'Crashing tides, smugglers, and alchemical powder' },
  { id: 'Undead Siege', label: 'Crypt of the Pale Knights', desc: 'Desecrated tombs, spectral guardians, and holy relics' },
  { id: 'Dragon Hunt', label: 'Obsidian Caldera Raid', desc: 'Volcanic magma vents, drakes, and legendary hoard' }
];

const DIFFICULTIES = ['Novice', 'Adept', 'Challenging', 'Deadly'];

export default function CampaignGeneratorModal({ player, companions = [], onCampaignCreated, onClose }) {
  const [selectedTheme, setSelectedTheme] = useState('Dungeon Crawl');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Adept');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (isGenerating) return;
    soundFx.playClick();
    setIsGenerating(true);

    try {
      const partyComposition = [player?.class || 'Warrior', ...companions.map(c => c.class)];
      const campaign = await generateCustomCampaign({
        theme: selectedTheme,
        difficulty: selectedDifficulty,
        partyLevel: 1,
        partyComposition
      });

      if (campaign) {
        soundFx.playSuccess(true);
        onCampaignCreated(campaign);
      }
    } catch (err) {
      console.warn('Failed to generate campaign:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-xl bg-tavern-wood border-2 border-tavern-gold rounded-2xl p-6 shadow-candle-lg text-tavern-parchment relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={() => { soundFx.playClick(); onClose(); }}
          className="absolute top-4 right-4 text-tavern-gold hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tavern-umber border border-tavern-amber text-xs font-cinzel text-tavern-gold uppercase mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-tavern-glow" />
            <span>AI Dungeon Master Forge</span>
          </div>
          <h3 className="text-2xl font-cinzel font-bold text-tavern-glow">Generate Custom Campaign</h3>
          <p className="text-xs text-tavern-parchment/70 font-sans mt-1">
            Specify your quest parameters and let the DM craft a unique multi-stage adventure
          </p>
        </div>

        {/* 1. Theme Selector */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider block">
            1. Select Campaign Theme
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => { soundFx.playClick(); setSelectedTheme(theme.id); }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-tavern-umber border-tavern-glow shadow-candle'
                      : 'bg-tavern-darkest/80 border-tavern-amber/30 hover:border-tavern-gold/60'
                  }`}
                >
                  <div className="font-cinzel font-bold text-xs text-tavern-glow">{theme.label}</div>
                  <div className="text-[10px] text-tavern-parchment/60 font-sans mt-0.5 line-clamp-1">{theme.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Difficulty Selector */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider block">
            2. Difficulty Tier
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTIES.map((diff) => {
              const isSelected = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => { soundFx.playClick(); setSelectedDifficulty(diff); }}
                  className={`py-2 rounded-lg border text-center font-cinzel text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-tavern-gold text-tavern-darkest border-tavern-glow shadow-candle'
                      : 'bg-tavern-darkest/80 text-tavern-parchment border-tavern-amber/30 hover:border-tavern-gold/60'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Action */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-base shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'The DM is Crafting Your Fate...' : 'Forge Campaign & Pin to Board'}</span>
        </button>
      </motion.div>
    </div>
  );
}
