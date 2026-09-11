import React, { useState } from 'react';
import { Shield, Sparkles, Compass, Swords, Skull, Flame, ArrowRight, Check } from 'lucide-react';
import { CAMPAIGN_PRESETS } from '../constants/campaigns';
import { soundFx } from '../services/audio';

export default function CampaignSelectorModal({ isOpen, onSelectCampaign, onClose, currentCampaignId }) {
  const [selectedId, setSelectedId] = useState(currentCampaignId || 'shadowfell_crypt');

  if (!isOpen) return null;

  const selectedCampaign = CAMPAIGN_PRESETS.find(c => c.id === selectedId) || CAMPAIGN_PRESETS[0];

  const handleConfirm = () => {
    soundFx.playClick();
    soundFx.playSuccess(false);
    onSelectCampaign(selectedCampaign);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-stone-900/95 border-2 border-tavern-gold/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tavern-amber/30 bg-tavern-darkest/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-tavern-umber/80 border border-tavern-gold/40">
              <Compass className="w-5 h-5 text-tavern-glow animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-tavern-glow via-tavern-gold to-tavern-amber">
                Select Your Campaign Chronicle
              </h2>
              <p className="text-xs text-tavern-parchment/70 font-sans">
                Choose the saga that will shape your world, factions, and companion encounters
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={() => { soundFx.playClick(); onClose(); }}
              className="text-stone-400 hover:text-tavern-glow text-sm px-2.5 py-1 rounded bg-stone-800 border border-stone-700 font-cinzel"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Campaign Grid & Detail View */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-y-auto flex-1">
          {/* Left: Campaign List */}
          <div className="md:col-span-5 p-4 border-r border-tavern-amber/20 space-y-2 bg-stone-950/60 overflow-y-auto max-h-96 md:max-h-none">
            {CAMPAIGN_PRESETS.map((camp) => {
              const isSelected = camp.id === selectedId;
              return (
                <button
                  key={camp.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedId(camp.id);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex items-start gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-tavern-umber/90 to-stone-900 border-tavern-glow shadow-candle ring-1 ring-tavern-gold/50'
                      : 'bg-stone-900/50 border-stone-800 hover:border-tavern-amber/40 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-tavern-gold/30">
                    <img src={camp.bgImage} alt={camp.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-cinzel font-bold truncate ${isSelected ? 'text-tavern-glow' : 'text-stone-200'}`}>
                        {camp.title}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-tavern-glow flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-tavern-parchment/60 truncate font-sans">
                      {camp.subtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 font-cinzel border border-stone-700">
                        {camp.difficulty}
                      </span>
                      <span className="text-[10px] text-tavern-gold/70">
                        {camp.recommendedLevel}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Campaign Detailed Overview */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-4 bg-gradient-to-b from-stone-900/40 via-stone-900/90 to-stone-950">
            <div className="space-y-4">
              {/* Campaign Backdrop Hero Banner */}
              <div className="relative h-36 rounded-xl overflow-hidden border border-tavern-gold/40 shadow-inner">
                <img
                  src={selectedCampaign.bgImage}
                  alt={selectedCampaign.title}
                  className="w-full h-full object-cover brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] uppercase tracking-widest text-tavern-glow font-cinzel font-bold">
                    Chronicle Setting
                  </span>
                  <h3 className="text-lg font-cinzel font-bold text-white leading-tight">
                    {selectedCampaign.title}
                  </h3>
                </div>
              </div>

              {/* Story Overview */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider">
                  The Saga Synopsis
                </h4>
                <p className="text-xs text-tavern-parchment/90 leading-relaxed font-sans bg-stone-950/50 p-3 rounded-lg border border-stone-800">
                  {selectedCampaign.description}
                </p>
              </div>

              {/* Main Objective */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-cinzel font-bold text-tavern-glow uppercase tracking-wider flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-tavern-glow" />
                  Primary Campaign Quest
                </h4>
                <div className="text-xs text-amber-200/90 bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-lg">
                  {selectedCampaign.mainQuest}
                </div>
              </div>

              {/* Starting World Nodes */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider">
                  Key World Locations
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedCampaign.startingNodes.map((node) => (
                    <div key={node.id} className="p-2 rounded bg-stone-950/70 border border-stone-800 text-[11px]">
                      <span className="font-cinzel font-bold text-stone-200 block truncate">{node.name}</span>
                      <span className="text-stone-400 text-[10px] block truncate">{node.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm Selection Action */}
            <div className="pt-3 border-t border-tavern-amber/20 flex justify-end">
              <button
                onClick={handleConfirm}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-stone-950 font-cinzel font-bold text-sm shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>Embark on this Saga</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
