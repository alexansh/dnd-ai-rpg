"use client";

import React, { useState } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { SRD_CLASSES } from "@/lib/srd/classes";
import { SRD_RACES } from "@/lib/srd/races";
import { AbilityScores, AbilityScoreKey } from "@/lib/srd/types";
import { X, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";

export default function CreationModal() {
  const { isCreationOpen, openCreation, setPlayer } = useGameStore();

  const [name, setName] = useState("Kaelen Ashborne");
  const [selectedRace, setSelectedRace] = useState("human");
  const [selectedClass, setSelectedClass] = useState("fighter");
  const [portraitUrl, setPortraitUrl] = useState("/assets/images/archetypes/warrior.jpg");
  const [isRenderingArt, setIsRenderingArt] = useState(false);

  // Standard Array
  const [abilities, setAbilities] = useState<AbilityScores>({
    str: 15,
    dex: 14,
    con: 13,
    int: 12,
    wis: 10,
    cha: 8,
  });

  if (!isCreationOpen) return null;

  const raceDef = SRD_RACES[selectedRace] || SRD_RACES.human;
  const classDef = SRD_CLASSES[selectedClass] || SRD_CLASSES.fighter;

  const handleRerollArt = async () => {
    setIsRenderingArt(true);
    try {
      const res = await fetch("/api/portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          race: raceDef.name,
          characterClass: classDef.name,
          description: raceDef.portraitDescriptor,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) setPortraitUrl(data.url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRenderingArt(false);
    }
  };

  const handleSaveCharacter = () => {
    // Apply racial bonuses
    const finalScores: AbilityScores = { ...abilities };
    Object.entries(raceDef.abilityScoreIncreases).forEach(([k, val]) => {
      finalScores[k as AbilityScoreKey] += val ?? 0;
    });

    const conMod = Math.floor((finalScores.con - 10) / 2);
    const maxHp = classDef.hitDie + conMod;

    setPlayer({
      name: name.trim() || "Adventurer",
      race: raceDef.name,
      className: classDef.name,
      abilities: finalScores,
      maxHp,
      currentHp: maxHp,
      portrait: portraitUrl,
      inventory: [...classDef.defaultStartingGear],
      equippedWeapon: classDef.defaultStartingGear[0] || "longsword",
      equippedArmor: classDef.defaultStartingGear[1] || "leather_armor",
    });

    openCreation(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-obsidian-900 border-2 border-gold-500/50 rounded-3xl shadow-gold-glow-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gold-500/20 bg-obsidian-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-cinzel text-xl font-bold text-gold-400 tracking-wider">
                HERO FORGE • CHARACTER CREATION
              </h1>
              <p className="text-xs text-parchment-300/60 font-mono">
                Standard Array D&D 5e Rules
              </p>
            </div>
          </div>
          <button
            onClick={() => openCreation(false)}
            className="p-2 rounded-xl text-parchment-300 hover:text-gold-400 hover:bg-obsidian-850 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Portrait & Name */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-gold-500 shadow-xl relative group">
                <img src={portraitUrl} alt="Character" className="w-full h-full object-cover" />
                {isRenderingArt && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-gold-400 text-xs font-cinzel font-bold">
                    Rendering Art...
                  </div>
                )}
              </div>

              <button
                onClick={handleRerollArt}
                disabled={isRenderingArt}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gold-400 border border-gold-500/40 text-xs font-cinzel font-bold transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRenderingArt ? "animate-spin" : ""}`} />
                <span>Reroll Portrait</span>
              </button>

              <div className="w-full text-left">
                <label className="block text-xs font-cinzel font-bold text-gold-400 mb-1">
                  Hero Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-obsidian-950 border border-gold-500/30 text-parchment-100 text-sm focus:outline-none focus:border-gold-400"
                />
              </div>
            </div>

            {/* Middle Column: Race & Class Pickers */}
            <div className="md:col-span-2 space-y-4">
              {/* Race Selector */}
              <div>
                <label className="block text-xs font-cinzel font-bold text-gold-400 mb-2">
                  Select Race
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(SRD_RACES).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRace(r.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedRace === r.id
                          ? "bg-gold-500/20 border-gold-500 text-gold-300 font-bold"
                          : "bg-obsidian-950/70 border-gold-500/20 text-parchment-200 hover:border-gold-500/40"
                      }`}
                    >
                      <div className="text-xs font-cinzel">{r.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Selector */}
              <div>
                <label className="block text-xs font-cinzel font-bold text-gold-400 mb-2">
                  Select Class
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.values(SRD_CLASSES).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClass(c.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedClass === c.id
                          ? "bg-gold-500/20 border-gold-500 text-gold-300 font-bold"
                          : "bg-obsidian-950/70 border-gold-500/20 text-parchment-200 hover:border-gold-500/40"
                      }`}
                    >
                      <div className="text-xs font-cinzel">{c.name}</div>
                      <div className="text-[10px] text-parchment-300/50">d{c.hitDie} Hit Die</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard Array Ability Scores */}
              <div>
                <label className="block text-xs font-cinzel font-bold text-gold-400 mb-2">
                  Standard Array Ability Scores
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {(["str", "dex", "con", "int", "wis", "cha"] as const).map((key) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-center"
                    >
                      <div className="text-[10px] font-bold uppercase text-gold-400 font-cinzel">
                        {key}
                      </div>
                      <div className="text-base font-bold text-parchment-100 font-mono my-0.5">
                        {abilities[key]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gold-500/20 bg-obsidian-950 flex justify-end gap-3">
          <button
            onClick={() => openCreation(false)}
            className="px-5 py-2 rounded-xl text-parchment-300 hover:bg-obsidian-850 text-xs font-bold font-cinzel transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveCharacter}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 font-bold font-cinzel text-xs shadow-gold-glow transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Forge Character & Begin Chronicle</span>
          </button>
        </div>
      </div>
    </div>
  );
}