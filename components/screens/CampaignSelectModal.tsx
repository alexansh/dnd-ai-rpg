"use client";

import React from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { X, Compass, Swords, Shield, Scroll, CheckCircle2, Lock } from "lucide-react";

export default function CampaignSelectModal() {
  const { isCampaignSelectOpen, openCampaignSelect, setCurrentScreen, currentAct } = useGameStore();

  if (!isCampaignSelectOpen) return null;

  const handleEmbark = () => {
    openCampaignSelect(false);
    setCurrentScreen("game");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-obsidian-900 border-2 border-gold-500/50 rounded-3xl shadow-gold-glow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gold-500/20 bg-obsidian-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/30">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl font-bold text-gold-400 tracking-wider">
                CHRONICLES & CAMPAIGNS
              </h1>
              <p className="text-xs text-parchment-300/60 font-mono">
                Select your next quest module
              </p>
            </div>
          </div>
          <button
            onClick={() => openCampaignSelect(false)}
            className="p-2 rounded-xl text-parchment-300 hover:text-gold-400 hover:bg-obsidian-850 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {/* Active Module: The Sunken Crypt */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-gold-500/60 bg-obsidian-950 shadow-xl group">
            {/* Background Image Banner */}
            <div className="h-44 relative overflow-hidden">
              <img
                src="/assets/images/scenery/crypt.jpg"
                alt="The Sunken Crypt"
                className="w-full h-full object-cover object-center filter brightness-90 contrast-110 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-blood-600/80 text-white font-bold font-cinzel text-[10px] uppercase tracking-wider border border-blood-400 shadow-md">
                  Active Campaign
                </span>
                <span className="px-2.5 py-1 rounded-full bg-obsidian-950/80 text-gold-400 font-mono text-[10px] border border-gold-500/40 backdrop-blur-md">
                  Level 1 • 4 Acts
                </span>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-parchment-100">
                  The Sunken Crypt
                </h3>
                <p className="text-xs text-parchment-300/80 mt-1 leading-relaxed">
                  Beneath the drowned monastery ruins of Oakhaven, an ancient crypt has cracked open. Restless skeletal sentinels guard the flooded ossuaries, while a sinister Wight Lord drains the vital essence of all who trespass.
                </p>
              </div>

              {/* Acts preview */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gold-500/20 text-xs">
                <div className={`p-2.5 rounded-xl border text-center ${currentAct >= 1 ? "bg-gold-500/10 border-gold-500/40 text-gold-300" : "bg-obsidian-900 border-gold-500/10 text-parchment-400"}`}>
                  <div className="font-cinzel font-bold text-[10px]">ACT I</div>
                  <div className="text-[11px] truncate">Entrance Door</div>
                </div>
                <div className={`p-2.5 rounded-xl border text-center ${currentAct >= 2 ? "bg-gold-500/10 border-gold-500/40 text-gold-300" : "bg-obsidian-900 border-gold-500/10 text-parchment-400"}`}>
                  <div className="font-cinzel font-bold text-[10px]">ACT II</div>
                  <div className="text-[11px] truncate">Flooded Ossuary</div>
                </div>
                <div className={`p-2.5 rounded-xl border text-center ${currentAct >= 3 ? "bg-gold-500/10 border-gold-500/40 text-gold-300" : "bg-obsidian-900 border-gold-500/10 text-parchment-400"}`}>
                  <div className="font-cinzel font-bold text-[10px]">ACT III</div>
                  <div className="text-[11px] truncate">Grid Combat</div>
                </div>
                <div className={`p-2.5 rounded-xl border text-center ${currentAct >= 4 ? "bg-gold-500/10 border-gold-500/40 text-gold-300" : "bg-obsidian-900 border-gold-500/10 text-parchment-400"}`}>
                  <div className="font-cinzel font-bold text-[10px]">ACT IV</div>
                  <div className="text-[11px] truncate">Wight Lord</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-parchment-300/60 font-mono">
                  Current Status: Resumed at Act {currentAct}
                </span>
                <button
                  onClick={handleEmbark}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 font-cinzel font-bold text-xs shadow-gold-glow transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>Embark into the Crypt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Teaser Chapters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-obsidian-950/60 border border-gold-500/20 opacity-60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-parchment-300">
                  <Lock className="w-3.5 h-3.5 text-gold-500" />
                  <span>The Whispering Woods</span>
                </div>
                <p className="text-[11px] text-parchment-300/50 mt-1">
                  Level 2-3 • Feywild corruption & owlbear dens
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-obsidian-900 text-parchment-400 border border-gold-500/20">
                Coming Soon
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-obsidian-950/60 border border-gold-500/20 opacity-60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-cinzel font-bold text-parchment-300">
                  <Lock className="w-3.5 h-3.5 text-gold-500" />
                  <span>The Sunken Citadel of Oakhaven</span>
                </div>
                <p className="text-[11px] text-parchment-300/50 mt-1">
                  Level 3-4 • Dragon wyrmling & goblin tribes
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-obsidian-900 text-parchment-400 border border-gold-500/20">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}