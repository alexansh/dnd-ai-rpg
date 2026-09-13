"use client";

import React, { useState } from "react";
import { useGameStore } from "@/lib/state/useGameStore";
import { getItemDefinition } from "@/lib/engine/inventory";
import { calculateAbilityModifier, calculateProficiencyBonus } from "@/lib/engine/rules";
import { SRD_SPELLS } from "@/lib/srd/spells";
import { SRD_CONDITIONS } from "@/lib/engine/conditions";
import InventoryPanel from "@/components/inventory/InventoryPanel";
import {
  Shield,
  Heart,
  Zap,
  X,
  Bed,
  Moon,
  Swords,
  Sparkles,
  Trash2,
  Dice5,
  Eye,
  Crosshair,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Footprints,
  Hand,
  Search,
} from "lucide-react";

export const SRD_SKILLS: { name: string; ability: "str" | "dex" | "con" | "int" | "wis" | "cha" }[] = [
  { name: "Athletics", ability: "str" },
  { name: "Acrobatics", ability: "dex" },
  { name: "Sleight of Hand", ability: "dex" },
  { name: "Stealth", ability: "dex" },
  { name: "Arcana", ability: "int" },
  { name: "History", ability: "int" },
  { name: "Investigation", ability: "int" },
  { name: "Nature", ability: "int" },
  { name: "Religion", ability: "int" },
  { name: "Animal Handling", ability: "wis" },
  { name: "Insight", ability: "wis" },
  { name: "Medicine", ability: "wis" },
  { name: "Perception", ability: "wis" },
  { name: "Survival", ability: "wis" },
  { name: "Deception", ability: "cha" },
  { name: "Intimidation", ability: "cha" },
  { name: "Performance", ability: "cha" },
  { name: "Persuasion", ability: "cha" },
];

export default function CharacterSheetModal() {
  const {
    isCharacterSheetOpen,
    openCharacterSheet,
    player,
    restShort,
    restLong,
    setPlayer,
    openDeleteModal,
    performSkillCheck,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<"stats" | "economy" | "armory" | "spells">("stats");
  const [economyFilter, setEconomyFilter] = useState<"all" | "action" | "bonus" | "reaction" | "free">("all");

  if (!isCharacterSheetOpen || !player) return null;

  const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"] as const;
  const profBonus = calculateProficiencyBonus(player.level);

  // Skill proficiencies (Class archetypes)
  const isSkillProficient = (skillName: string) => {
    const s = skillName.toLowerCase();
    const c = player.className.toLowerCase();
    if (c.includes("fighter")) return s === "athletics" || s === "perception" || s === "intimidation";
    if (c.includes("rogue")) return s === "stealth" || s === "sleight of hand" || s === "acrobatics" || s === "investigation";
    if (c.includes("cleric")) return s === "insight" || s === "religion" || s === "medicine";
    if (c.includes("wizard")) return s === "arcana" || s === "history" || s === "investigation";
    return s === "athletics" || s === "perception";
  };

  const getSkillModifier = (skill: (typeof SRD_SKILLS)[0]) => {
    const abilityMod = calculateAbilityModifier(player.abilities[skill.ability]);
    const prof = isSkillProficient(skill.name) ? profBonus : 0;
    return abilityMod + prof;
  };

  const wisMod = calculateAbilityModifier(player.abilities.wis);
  const passivePerception = 10 + wisMod + (isSkillProficient("Perception") ? profBonus : 0);
  const initiativeMod = calculateAbilityModifier(player.abilities.dex);

  const equippedWeaponDef = player.equippedWeapon ? getItemDefinition(player.equippedWeapon) : undefined;
  const equippedArmorDef = player.equippedArmor ? getItemDefinition(player.equippedArmor) : undefined;
  const equippedShieldDef = player.equippedShield ? getItemDefinition(player.equippedShield) : undefined;

  // Spell slots toggle
  const handleToggleSpellSlot = (slotIdx: number) => {
    if (slotIdx < player.spellSlotsLevel1) {
      setPlayer({ spellSlotsLevel1: player.spellSlotsLevel1 - 1 });
    } else {
      setPlayer({ spellSlotsLevel1: Math.min(player.maxSpellSlotsLevel1, player.spellSlotsLevel1 + 1) });
    }
  };

  // Action economy entries
  const weaponAttackBonus = calculateAbilityModifier(player.abilities.str) + profBonus;
  const actionEntries = [
    {
      id: "equipped_weapon_strike",
      name: equippedWeaponDef?.name ? `${equippedWeaponDef.name} Strike` : "Unarmed Strike",
      type: "action" as const,
      range: equippedWeaponDef?.weaponRange === "ranged" ? "80/320 ft" : "5 ft (Melee)",
      hitBonus: `+${weaponAttackBonus}`,
      damage: equippedWeaponDef?.damageDice
        ? `${equippedWeaponDef.damageDice} + ${calculateAbilityModifier(player.abilities.str)} ${equippedWeaponDef.damageType || "slashing"}`
        : `1 + ${calculateAbilityModifier(player.abilities.str)} bludgeoning`,
      description: equippedWeaponDef?.description || "Make a physical melee strike against a target within reach.",
      icon: Swords,
    },
    {
      id: "action_dash",
      name: "Dash",
      type: "action" as const,
      range: "Self",
      description: "Gain extra movement for the current turn equal to your speed (+" + player.speed + " ft).",
      icon: Footprints,
    },
    {
      id: "action_disengage",
      name: "Disengage",
      type: "action" as const,
      range: "Self",
      description: "Your movement doesn't provoke opportunity attacks for the rest of the turn.",
      icon: Sparkles,
    },
    {
      id: "action_dodge",
      name: "Dodge",
      type: "action" as const,
      range: "Self",
      description: "Attack rolls against you have disadvantage until the start of your next turn; DEX saves have advantage.",
      icon: Shield,
    },
    {
      id: "action_help",
      name: "Help",
      type: "action" as const,
      range: "5 ft",
      description: "Feint or assist an ally, granting advantage on their next ability check or attack roll.",
      icon: Hand,
    },
    {
      id: "action_hide",
      name: "Hide",
      type: "action" as const,
      range: "Self",
      description: "Make a Dexterity (Stealth) check in an attempt to conceal yourself from sight.",
      icon: Eye,
    },
    {
      id: "action_search",
      name: "Search",
      type: "action" as const,
      range: "Perception cone",
      description: "Devote your senses to finding hidden enemies, traps, secret doors, or concealed objects.",
      icon: Search,
    },
    {
      id: "bonus_second_wind",
      name: "Second Wind",
      type: "bonus" as const,
      range: "Self",
      damage: `1d10 + ${player.level} HP`,
      description: "Tap into a well of stamina to regain hit points on your turn (Recharges on short rest).",
      icon: Heart,
    },
    {
      id: "bonus_offhand_strike",
      name: "Offhand Light Strike",
      type: "bonus" as const,
      range: "5 ft (Melee)",
      hitBonus: `+${weaponAttackBonus}`,
      damage: "1d4 piercing / slashing",
      description: "When you attack with a light melee weapon, strike with a different light melee weapon held in your other hand.",
      icon: Swords,
    },
    {
      id: "reaction_opportunity",
      name: "Opportunity Attack",
      type: "reaction" as const,
      range: "5 ft (Melee)",
      hitBonus: `+${weaponAttackBonus}`,
      damage: equippedWeaponDef?.damageDice || "1d8 slashing",
      description: "Make a melee attack when a hostile creature you can see moves out of your reach.",
      icon: Crosshair,
    },
    {
      id: "free_interact",
      name: "Interact with an Object",
      type: "free" as const,
      range: "5 ft",
      description: "Open an unlocked door, draw or sheathe a weapon, or retrieve an easily accessible item.",
      icon: Hand,
    },
  ];

  const filteredActions = actionEntries.filter((item) => {
    if (economyFilter === "all") return true;
    return item.type === economyFilter;
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-parchment-100 via-parchment-150 to-parchment-200 text-obsidian-950 rounded-3xl border-4 border-gold-600 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Ornate Gold Border Bar */}
        <div className="h-2 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-parchment-400/60 bg-parchment-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gold-600 shadow-md flex-shrink-0">
              <img src={player.portrait} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-2xl font-bold tracking-wide text-obsidian-950">
                  {player.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-700 font-bold font-cinzel border border-gold-600/30">
                  LEVEL {player.level}
                </span>
                {player.inspiration && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-900 font-extrabold font-cinzel border border-amber-600/40 animate-pulse flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-700" /> Inspired
                  </span>
                )}
              </div>
              <p className="text-sm text-parchment-900/80 font-medium">
                {player.race} {player.className} • Folk Hero Background
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Rest Buttons */}
            <button
              onClick={restShort}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-parchment-300 hover:bg-parchment-400 text-obsidian-900 font-semibold text-xs border border-parchment-500 transition-all shadow-sm"
              title="Spend Hit Die to heal (1 hour)"
            >
              <Bed className="w-4 h-4 text-gold-700" />
              <span>Short Rest</span>
            </button>
            <button
              onClick={restLong}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 text-parchment-100 font-semibold text-xs border border-gold-500 transition-all shadow-md"
              title="Full recovery of HP and slots (8 hours)"
            >
              <Moon className="w-4 h-4 text-amber-400" />
              <span>Long Rest</span>
            </button>
            <button
              onClick={() => openCharacterSheet(false)}
              className="p-2 rounded-xl text-obsidian-800 hover:bg-parchment-300 transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-8 pt-3 pb-2 border-b border-parchment-300/80 bg-parchment-100">
          {[
            { id: "stats", label: "Core Stats & Skills" },
            { id: "economy", label: "Action Economy (5e)" },
            { id: "armory", label: "Armory & Satchel" },
            { id: "spells", label: "Spells & Slot Pips" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-xl font-cinzel font-bold text-xs transition-all ${
                activeTab === tab.id
                  ? "bg-gold-600 text-white shadow-md border border-gold-700"
                  : "bg-parchment-200/90 text-obsidian-900 hover:bg-parchment-300 border border-parchment-400/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CORE STATS & SKILLS */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              {/* Key Vitals Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-400 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-parchment-900/70 font-bold uppercase tracking-wider font-cinzel mb-1">
                    <Heart className="w-3.5 h-3.5 text-blood-600" /> HP
                  </div>
                  <div className="text-xl font-bold font-mono text-blood-700">
                    {player.currentHp} / {player.maxHp}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-400 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-parchment-900/70 font-bold uppercase tracking-wider font-cinzel mb-1">
                    <Shield className="w-3.5 h-3.5 text-gold-700" /> Armor Class
                  </div>
                  <div className="text-xl font-bold font-mono text-obsidian-900">
                    {player.armorClass}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-400 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-parchment-900/70 font-bold uppercase tracking-wider font-cinzel mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-600" /> Speed
                  </div>
                  <div className="text-xl font-bold font-mono text-obsidian-900">
                    {player.speed} ft
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-400 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-parchment-900/70 font-bold uppercase tracking-wider font-cinzel mb-1">
                    <Swords className="w-3.5 h-3.5 text-obsidian-700" /> Initiative
                  </div>
                  <div className="text-xl font-bold font-mono text-obsidian-900">
                    {initiativeMod >= 0 ? `+${initiativeMod}` : initiativeMod}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-400 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-parchment-900/70 font-bold uppercase tracking-wider font-cinzel mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-700" /> Proficiency
                  </div>
                  <div className="text-xl font-bold font-mono text-obsidian-900">
                    +{profBonus}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-400 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-parchment-900/70 font-bold uppercase tracking-wider font-cinzel mb-1">
                    <Eye className="w-3.5 h-3.5 text-sky-700" /> Passive Perc.
                  </div>
                  <div className="text-xl font-bold font-mono text-sky-800">
                    {passivePerception}
                  </div>
                </div>
              </div>

              {/* 6 Ability Scores Cards */}
              <div>
                <h3 className="font-cinzel text-xs font-bold text-obsidian-900 mb-2.5 tracking-wider uppercase">
                  Ability Scores & Modifiers
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {abilityKeys.map((key) => {
                    const score = player.abilities[key];
                    const mod = calculateAbilityModifier(score);
                    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                    return (
                      <div
                        key={key}
                        className="p-3 rounded-2xl bg-parchment-50 border-2 border-gold-600/40 text-center shadow-sm"
                      >
                        <div className="text-[11px] font-extrabold uppercase tracking-widest text-parchment-900/70 font-cinzel">
                          {key}
                        </div>
                        <div className="text-2xl font-extrabold text-gold-700 font-cinzel my-0.5">
                          {modStr}
                        </div>
                        <div className="text-xs text-parchment-900/60 font-mono font-bold">
                          {score}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Condition Tray (§1.4) */}
              <div className="p-4 rounded-2xl bg-parchment-100/80 border border-parchment-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-cinzel text-xs font-bold text-obsidian-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    Active Conditions & Status
                  </h3>
                  <span className="text-[10px] text-parchment-900/60 font-mono">
                    SRD Condition Tracker
                  </span>
                </div>

                {player.conditions.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>In fighting trim: No negative status conditions or exhaustion active.</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {player.conditions.map((cond, idx) => {
                      const condName = typeof cond === "string" ? cond : (cond as any).name || "condition";
                      const condKey = condName.toLowerCase() as keyof typeof SRD_CONDITIONS;
                      const condDef = SRD_CONDITIONS[condKey];
                      const rounds = typeof cond === "object" && (cond as any).roundsRemaining ? `${(cond as any).roundsRemaining} rds` : "Active";
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blood-50 border border-blood-400 text-blood-900 shadow-sm"
                          title={condDef?.description || condName}
                        >
                          <span className="font-cinzel font-bold text-xs capitalize">
                            {condName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blood-200 text-blood-900 font-mono font-bold">
                            {rounds}
                          </span>
                          {condDef?.description && (
                            <span className="text-[11px] text-blood-700 font-sans hidden sm:inline">
                              • {condDef.description.slice(0, 45)}...
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 18 SRD Skills List (§5.2) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-cinzel text-xs font-bold text-obsidian-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Dice5 className="w-3.5 h-3.5 text-gold-700" />
                    18 SRD Skill Proficiencies (Click to Roll)
                  </h3>
                  <span className="text-[10px] text-parchment-900/60 font-mono">
                    DC 15 Standard Check
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {SRD_SKILLS.map((skill) => {
                    const isProf = isSkillProficient(skill.name);
                    const mod = getSkillModifier(skill);
                    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

                    return (
                      <button
                        key={skill.name}
                        onClick={() => {
                          openCharacterSheet(false);
                          performSkillCheck(skill.name, 15, skill.ability);
                        }}
                        className="group flex items-center justify-between p-2.5 rounded-xl bg-parchment-50 hover:bg-gold-50/80 border border-parchment-300 hover:border-gold-500 transition-all text-left shadow-sm hover:scale-[1.01] active:scale-98"
                        title={`Roll ${skill.name} check (${modStr})`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full border ${
                              isProf
                                ? "bg-gold-600 border-gold-700 shadow-sm"
                                : "bg-parchment-200 border-parchment-400"
                            }`}
                          />
                          <div>
                            <div className="text-xs font-cinzel font-bold text-obsidian-950 group-hover:text-gold-800">
                              {skill.name}
                            </div>
                            <div className="text-[10px] uppercase font-mono text-parchment-900/60 font-semibold">
                              {skill.ability}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm font-mono font-extrabold text-gold-700 group-hover:text-gold-900 px-2 py-0.5 rounded bg-parchment-200/80 group-hover:bg-gold-200/60 border border-parchment-300">
                          {modStr}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTION ECONOMY */}
          {activeTab === "economy" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: "all", label: "All Actions" },
                      { id: "action", label: "Actions" },
                      { id: "bonus", label: "Bonus Actions" },
                      { id: "reaction", label: "Reactions" },
                      { id: "free", label: "Free Actions" },
                    ] as const
                  ).map((pill) => (
                    <button
                      key={pill.id}
                      onClick={() => setEconomyFilter(pill.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold font-cinzel transition-all ${
                        economyFilter === pill.id
                          ? "bg-gold-600 text-white shadow-sm"
                          : "bg-parchment-200/90 hover:bg-parchment-300 text-obsidian-900 border border-parchment-400/60"
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] font-mono text-parchment-900/70">
                  5e SRD Standard Turn Budget
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-300 flex flex-col justify-between hover:border-gold-500/70 transition-all shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-600/40 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4 text-gold-800" />
                            </div>
                            <span className="font-cinzel font-bold text-sm text-obsidian-950">
                              {act.name}
                            </span>
                          </div>

                          <span className="text-[9px] px-2 py-0.5 rounded-full font-cinzel font-bold uppercase tracking-wider bg-parchment-200 text-parchment-900 border border-parchment-400">
                            {act.type}
                          </span>
                        </div>

                        <p className="text-xs text-parchment-900/80 mt-2">
                          {act.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-parchment-900/70 font-mono mt-3 pt-2 border-t border-parchment-200">
                        {act.hitBonus && (
                          <span className="font-bold text-gold-700">
                            Hit: {act.hitBonus}
                          </span>
                        )}
                        {act.damage && (
                          <span className="font-bold text-blood-700">
                            Formula: {act.damage}
                          </span>
                        )}
                        <span>Range: {act.range}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ARMORY & SATCHEL */}
          {activeTab === "armory" && <InventoryPanel />}

          {/* TAB 4: SPELLS & SLOT PIPS */}
          {activeTab === "spells" && (
            <div className="space-y-6">
              {/* Level 1 Spell Slot Tracker */}
              <div className="p-4 rounded-2xl bg-parchment-50 border border-parchment-300 flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-xs font-bold text-obsidian-900 uppercase tracking-wider">
                    Level 1 Spell Slots
                  </h3>
                  <p className="text-xs text-parchment-900/70 mt-0.5">
                    Click pips to expend or restore spell slots manually.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.max(2, player.maxSpellSlotsLevel1) }).map((_, idx) => {
                    const isAvailable = idx < player.spellSlotsLevel1;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleSpellSlot(idx)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-cinzel font-extrabold text-xs transition-all border shadow-sm ${
                          isAvailable
                            ? "bg-purple-600 text-white border-purple-700 hover:bg-purple-700"
                            : "bg-parchment-300 text-parchment-700 border-parchment-400 hover:bg-parchment-400"
                        }`}
                        title={isAvailable ? "Click to expend slot" : "Click to recover slot"}
                      >
                        {isAvailable ? "●" : "○"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prepared Spells Catalog */}
              <div>
                <h3 className="font-cinzel text-xs font-bold text-obsidian-900 uppercase tracking-wider mb-3">
                  Grimoire & Prepared Cantrips / Spells
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.values(SRD_SPELLS).map((spell) => (
                    <div
                      key={spell.id}
                      className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-300 hover:border-purple-500/60 transition-all shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-cinzel font-bold text-sm text-obsidian-950">
                              {spell.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-300 font-bold uppercase font-mono">
                              {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}
                            </span>
                          </div>
                          <div className="text-[11px] text-parchment-900/60 font-mono mt-0.5">
                            {spell.school} • {spell.castingTime} • {spell.range}
                          </div>
                        </div>

                        {spell.isConcentration && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 border border-amber-500/40 font-cinzel font-bold">
                            Concentration
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-parchment-900/80 mt-2">
                        {spell.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-parchment-900/70 font-mono mt-2 pt-2 border-t border-parchment-200">
                        {spell.damageDice && (
                          <span className="font-bold text-blood-700">
                            ⚔ {spell.damageDice} {spell.damageType}
                          </span>
                        )}
                        {spell.healingDice && (
                          <span className="font-bold text-emerald-700">
                            💚 {spell.healingDice} HP
                          </span>
                        )}
                        <span>Duration: {spell.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone: Character Deletion */}
          <div className="pt-4 border-t border-parchment-400/60 flex items-center justify-between bg-parchment-100/50 p-4 rounded-2xl border border-blood-500/20">
            <div>
              <h4 className="font-cinzel text-xs font-bold text-blood-700 uppercase tracking-wider">
                Danger Zone • Rite of Ash
              </h4>
              <p className="text-[11px] text-parchment-900/70">
                Permanently incinerate this hero scroll and purge their campaign chronicle.
              </p>
            </div>

            <button
              onClick={() => {
                openCharacterSheet(false);
                openDeleteModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blood-100 hover:bg-blood-200 text-blood-800 border border-blood-400/60 font-cinzel font-bold text-xs transition-all shadow-sm hover:scale-[1.02] active:scale-98"
            >
              <Trash2 className="w-3.5 h-3.5 text-blood-700" />
              <span>Delete Character</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}