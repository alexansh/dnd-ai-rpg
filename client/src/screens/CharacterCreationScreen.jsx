import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shield,
  Wand2,
  Sword,
  Heart,
  Coins,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  User,
  Flame,
  Shuffle,
  Plus,
  Minus,
  Dices,
  BookOpen,
  Feather
} from 'lucide-react';
import { ARCHETYPES, getStatModifier } from '../constants/archetypes';
import {
  DND_RACES,
  DND_CLASSES,
  POINT_BUY_COSTS,
  TOTAL_POINT_BUY_POINTS,
  STANDARD_ARRAY,
  RANDOM_APPEARANCES,
  RANDOM_BACKSTORIES,
  getDynamicAppearance,
  getDynamicBackstory,
  generateRandomHeroName
} from '../constants/dnd5eRules';
import { getComplementaryCompanions } from '../constants/companions';
import { generateCharacterPortrait } from '../services/api';
import PortraitDisplay from '../components/PortraitDisplay';
import EmberParticles from '../components/EmberParticles';
import { useGame } from '../context/GameContext';
import { soundFx } from '../services/audio';

export default function CharacterCreationScreen() {
  const { setPendingCharacter, setCurrentScreen } = useGame();

  // Mode: 'archetype' (Pre-made quick start) vs 'custom' (Full D&D 5e Forge)
  const [creationMode, setCreationMode] = useState('archetype');

  // --- Archetype State ---
  const [selectedArchetypeId, setSelectedArchetypeId] = useState('Warrior');

  // --- Custom Hero Forge State ---
  const [selectedRaceId, setSelectedRaceId] = useState('human');
  const [selectedClassId, setSelectedClassId] = useState('Fighter');
  const [baseStats, setBaseStats] = useState({
    STR: 15,
    DEX: 13,
    CON: 14,
    INT: 10,
    WIS: 12,
    CHA: 8
  });

  // --- Shared Fields ---
  const [name, setName] = useState(() => generateRandomHeroName('human', 'Fighter'));
  const [appearance, setAppearance] = useState(ARCHETYPES[0].defaultAppearance);
  const [backstory, setBackstory] = useState(
    'A former castle sentinel who laid down their post after a fateful encounter in the shadowwoods, now seeking redemption and coin at The Wayward Flagon.'
  );
  const [portraitUrl, setPortraitUrl] = useState(null);
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);
  const [artGeneratedTime, setArtGeneratedTime] = useState(null);

  // Active object lookups
  const activeArchetype = ARCHETYPES.find((a) => a.id === selectedArchetypeId) || ARCHETYPES[0];
  const activeRace = DND_RACES.find((r) => r.id === selectedRaceId) || DND_RACES[0];
  const activeClass = DND_CLASSES.find((c) => c.id === selectedClassId) || DND_CLASSES[0];

  // Calculate Point Buy Spent
  const pointsSpent = Object.values(baseStats).reduce((acc, score) => {
    return acc + (POINT_BUY_COSTS[score] ?? 0);
  }, 0);
  const pointsRemaining = TOTAL_POINT_BUY_POINTS - pointsSpent;

  // Compute Total Stats (Base + Racial Bonus)
  const computeFinalStats = () => {
    if (creationMode === 'archetype') {
      return { ...activeArchetype.stats };
    }
    const final = {};
    const STAT_KEYS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    STAT_KEYS.forEach((stat) => {
      const base = baseStats[stat] || 8;
      const racialBonus = activeRace.bonuses[stat] || 0;
      final[stat] = base + racialBonus;
    });
    return final;
  };

  const finalStats = computeFinalStats();
  const conMod = Math.floor(((finalStats.CON || 10) - 10) / 2);
  const calculatedMaxHp =
    creationMode === 'archetype'
      ? activeArchetype.hp
      : Math.max(6, activeClass.baseHp + conMod);

  const characterClassName =
    creationMode === 'archetype' ? activeArchetype.name : `${activeRace.name} ${activeClass.name}`;

  // Portrait Generator Function
  const triggerGeneratePortrait = async (classNameToUse, descToUse) => {
    setIsGeneratingPortrait(true);
    try {
      const fullClass =
        creationMode === 'archetype'
          ? activeArchetype.name
          : `${activeRace.name} ${activeClass.name}`;
      const charClass = classNameToUse || fullClass;
      const desc = (descToUse !== undefined ? descToUse : appearance).trim();
      const res = await generateCharacterPortrait({
        characterClass: charClass,
        description: desc
      });
      if (res && res.imageUrl) {
        setPortraitUrl(res.imageUrl);
        setArtGeneratedTime(Date.now());
        soundFx.playSuccess(false);
      }
    } catch (e) {
      console.warn('Could not generate portrait:', e);
    } finally {
      setIsGeneratingPortrait(false);
    }
  };

  // Initial portrait generation
  useEffect(() => {
    triggerGeneratePortrait(activeArchetype.name, appearance);
  }, []);

  // Randomize Hero Name
  const handleRandomizeName = () => {
    soundFx.playClick();
    const newName = generateRandomHeroName(
      creationMode === 'archetype' ? 'human' : selectedRaceId,
      creationMode === 'archetype' ? activeArchetype.name : selectedClassId
    );
    setName(newName);
  };

  // Mode Switch Handlers
  const handleModeChange = (mode) => {
    soundFx.playClick();
    setCreationMode(mode);
    if (mode === 'archetype') {
      setName(generateRandomHeroName('human', activeArchetype.name));
      setAppearance(activeArchetype.defaultAppearance);
      setBackstory(
        'A former castle sentinel who laid down their post after a fateful encounter in the shadowwoods, now seeking redemption and coin at The Wayward Flagon.'
      );
      triggerGeneratePortrait(activeArchetype.name, activeArchetype.defaultAppearance);
    } else {
      setName(generateRandomHeroName(selectedRaceId, selectedClassId));
      const dynamicDesc = getDynamicAppearance(selectedRaceId, selectedClassId);
      const dynamicStory = getDynamicBackstory(selectedRaceId, selectedClassId);
      setAppearance(dynamicDesc);
      setBackstory(dynamicStory);
      triggerGeneratePortrait(`${activeRace.name} ${activeClass.name}`, dynamicDesc);
    }
  };

  // Archetype Select Handler
  const handleArchetypeSelect = (arch) => {
    soundFx.playClick();
    setSelectedArchetypeId(arch.id);
    setName(generateRandomHeroName('human', arch.name));
    setAppearance(arch.defaultAppearance);
    triggerGeneratePortrait(arch.name, arch.defaultAppearance);
  };

  // Race Select Handler (Custom Mode)
  const handleRaceSelect = (race) => {
    soundFx.playClick();
    setSelectedRaceId(race.id);
    setName(generateRandomHeroName(race.id, selectedClassId));
    const dynamicDesc = getDynamicAppearance(race.id, selectedClassId);
    const dynamicStory = getDynamicBackstory(race.id, selectedClassId);
    setAppearance(dynamicDesc);
    setBackstory(dynamicStory);
    triggerGeneratePortrait(`${race.name} ${activeClass.name}`, dynamicDesc);
  };

  // Class Select Handler (Custom Mode)
  const handleClassSelect = (cls) => {
    soundFx.playClick();
    setSelectedClassId(cls.id);
    const dynamicDesc = getDynamicAppearance(selectedRaceId, cls.id);
    const dynamicStory = getDynamicBackstory(selectedRaceId, cls.id);
    setAppearance(dynamicDesc);
    setBackstory(dynamicStory);
    triggerGeneratePortrait(`${activeRace.name} ${cls.name}`, dynamicDesc);
  };

  // Stat Adjust Handlers (5e Point-Buy)
  const handleStatChange = (stat, delta) => {
    soundFx.playClick();
    const currentScore = baseStats[stat];
    const newScore = currentScore + delta;

    if (newScore < 8 || newScore > 15) return;

    const currentCost = POINT_BUY_COSTS[currentScore] ?? 0;
    const newCost = POINT_BUY_COSTS[newScore] ?? 0;
    const costDiff = newCost - currentCost;

    if (delta > 0 && costDiff > pointsRemaining) return;

    setBaseStats((prev) => ({
      ...prev,
      [stat]: newScore
    }));
  };

  // Preset: 5e Standard Array [15, 14, 13, 12, 10, 8] optimized for primary stat
  const handleApplyStandardArray = () => {
    soundFx.playClick();
    const primary = activeClass.primaryStat || 'STR';
    const secondary = primary === 'STR' ? 'CON' : primary === 'DEX' ? 'INT' : 'DEX';

    const newStats = { STR: 8, DEX: 10, CON: 12, INT: 13, WIS: 14, CHA: 15 };
    const statsOrder = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    const remainingStats = statsOrder.filter((s) => s !== primary && s !== secondary);

    const updated = {
      [primary]: 15,
      [secondary]: 14,
      [remainingStats[0]]: 13,
      [remainingStats[1]]: 12,
      [remainingStats[2]]: 10,
      [remainingStats[3]]: 8
    };

    setBaseStats(updated);
  };

  // Randomize Appearance
  const handleRandomizeAppearance = () => {
    soundFx.playClick();
    const randomDesc = RANDOM_APPEARANCES[Math.floor(Math.random() * RANDOM_APPEARANCES.length)];
    setAppearance(randomDesc);
    triggerGeneratePortrait(
      creationMode === 'archetype' ? activeArchetype.name : `${activeRace.name} ${activeClass.name}`,
      randomDesc
    );
  };

  // Randomize Backstory
  const handleRandomizeBackstory = () => {
    soundFx.playClick();
    const randomStory = RANDOM_BACKSTORIES[Math.floor(Math.random() * RANDOM_BACKSTORIES.length)];
    setBackstory(randomStory);
  };

  // Manual Art Render Click
  const handleManualRender = () => {
    soundFx.playClick();
    triggerGeneratePortrait(
      creationMode === 'archetype' ? activeArchetype.name : `${activeRace.name} ${activeClass.name}`,
      appearance
    );
  };

  // Final Character Submission
  const handleCreateHero = () => {
    soundFx.playClick();
    soundFx.playSuccess(false);

    const finalName = name.trim() || (creationMode === 'archetype' ? activeArchetype.name : 'Valiant Hero');
    const heroClass = creationMode === 'archetype' ? activeArchetype.name : activeClass.name;
    const heroRace = creationMode === 'archetype' ? 'Human' : activeRace.name;
    const heroInventory =
      creationMode === 'archetype'
        ? [...activeArchetype.inventory]
        : [...activeClass.defaultInventory, ...(activeRace.racialTrinket ? [activeRace.racialTrinket] : [])];
    const heroAbilities =
      creationMode === 'archetype'
        ? [...activeArchetype.abilities]
        : [...activeClass.abilities, activeRace.trait];
    const heroGold = creationMode === 'archetype' ? activeArchetype.gold : activeClass.startingGold;

    const newHero = {
      name: finalName,
      class: heroClass,
      race: heroRace,
      stats: { ...finalStats },
      hp: calculatedMaxHp,
      maxHp: calculatedMaxHp,
      gold: heroGold,
      inventory: heroInventory,
      abilities: heroAbilities,
      backstory: backstory.trim(),
      appearance: appearance.trim(),
      portraitUrl: portraitUrl || null
    };

    setPendingCharacter(newHero);
    setCurrentScreen('campaign_select');
    soundFx.setMood('exploration_wonder');
  };

  return (
    <div className="relative min-h-screen p-3 sm:p-6 bg-[#0a0704] candle-glow-bg overflow-y-auto">
      <EmberParticles count={6} />
      <div className="relative z-10 max-w-5xl mx-auto space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-tavern-amber/40 pb-3">
          <button
            onClick={() => {
              soundFx.playClick();
              setCurrentScreen('character_select');
            }}
            className="flex items-center gap-1.5 text-xs font-cinzel text-tavern-gold hover:text-tavern-glow transition-colors px-3 py-1.5 rounded-lg bg-black/40 border border-tavern-gold/20"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Characters
          </button>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-tavern-glow">Hero Forge</h2>
            <p className="text-xs text-tavern-parchment/70 font-sans">
              Create your adventurer before stepping into The Wayward Flagon
            </p>
          </div>
          <div className="w-20" />
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-tavern-darkest/90 border border-tavern-amber/40 rounded-xl shadow-candle">
            <button
              onClick={() => handleModeChange('archetype')}
              className={`px-5 py-2 rounded-lg font-cinzel font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                creationMode === 'archetype'
                  ? 'bg-gradient-to-r from-tavern-amber to-tavern-gold text-tavern-darkest shadow-sm'
                  : 'text-tavern-gold/70 hover:text-tavern-gold'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Pre-Made Archetypes</span>
            </button>
            <button
              onClick={() => handleModeChange('custom')}
              className={`px-5 py-2 rounded-lg font-cinzel font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                creationMode === 'custom'
                  ? 'bg-gradient-to-r from-tavern-amber to-tavern-gold text-tavern-darkest shadow-sm'
                  : 'text-tavern-gold/70 hover:text-tavern-gold'
              }`}
            >
              <Sword className="w-4 h-4" />
              <span>Custom Hero Forge (D&D 5e Rules)</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODE 1: PRE-MADE ARCHETYPES */}
        {/* ========================================================= */}
        {creationMode === 'archetype' && (
          <div className="space-y-3">
            <h3 className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Select Pre-Made Archetype
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {ARCHETYPES.map((arch) => {
                const isSelected = arch.id === selectedArchetypeId;
                return (
                  <button
                    key={arch.id}
                    onClick={() => handleArchetypeSelect(arch)}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-tavern-umber border-tavern-glow shadow-candle scale-102 ring-1 ring-tavern-gold'
                        : 'bg-tavern-wood/70 border-tavern-amber/30 hover:border-tavern-gold/60 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="font-cinzel font-bold text-sm text-tavern-glow">{arch.name}</div>
                      <div className="text-[10px] text-tavern-parchment/60 font-sans line-clamp-1">{arch.subtitle}</div>
                    </div>
                    <div className="mt-2 text-[11px] font-mono text-tavern-gold flex justify-between">
                      <span>HP {arch.hp}</span>
                      <span>{arch.gold}g</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 2: CUSTOM HERO FORGE (D&D 5e) */}
        {/* ========================================================= */}
        {creationMode === 'custom' && (
          <div className="space-y-4">
            {/* Step 1: Race Selection */}
            <div className="space-y-2">
              <h3 className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4" /> 1. Choose Race / Ancestry
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {DND_RACES.map((race) => {
                  const isSelected = race.id === selectedRaceId;
                  return (
                    <button
                      key={race.id}
                      onClick={() => handleRaceSelect(race)}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-tavern-umber border-tavern-glow shadow-candle ring-1 ring-tavern-gold'
                          : 'bg-tavern-wood/70 border-tavern-amber/30 hover:border-tavern-gold/60 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="font-cinzel font-bold text-xs text-tavern-glow">{race.name}</div>
                        <div className="text-[9px] text-tavern-gold/80 font-mono mt-0.5 line-clamp-2">{race.trait}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Class Selection */}
            <div className="space-y-2">
              <h3 className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> 2. Choose Class
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {DND_CLASSES.map((cls) => {
                  const isSelected = cls.id === selectedClassId;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => handleClassSelect(cls)}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-tavern-umber border-tavern-glow shadow-candle ring-1 ring-tavern-gold'
                          : 'bg-tavern-wood/70 border-tavern-amber/30 hover:border-tavern-gold/60 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="font-cinzel font-bold text-xs text-tavern-glow">{cls.name}</div>
                        <div className="text-[9px] text-tavern-parchment/60 font-mono mt-0.5">d{cls.hitDie} Hit Die</div>
                      </div>
                      <div className="text-[9px] font-mono text-tavern-gold mt-1">Prim: {cls.primaryStat}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: D&D 5e Point-Buy & Stat Matrix */}
            <div className="p-4 rounded-xl bg-tavern-wood/90 border border-tavern-amber/40 shadow-candle space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-tavern-amber/20 pb-2">
                <div>
                  <h3 className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider flex items-center gap-1.5">
                    <Dices className="w-4 h-4" /> 3. Ability Scores (D&D 5e Point Buy)
                  </h3>
                  <p className="text-[11px] text-tavern-parchment/70 font-sans">
                    Allocate 27 points. Racial bonuses are added automatically.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-cinzel font-bold px-2.5 py-1 rounded-lg border ${
                      pointsRemaining >= 0
                        ? 'bg-tavern-darkest text-tavern-glow border-tavern-gold/50'
                        : 'bg-red-950/80 text-red-300 border-red-500'
                    }`}
                  >
                    Points Remaining: {pointsRemaining} / {TOTAL_POINT_BUY_POINTS}
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyStandardArray}
                    className="text-[10px] font-cinzel font-bold px-2.5 py-1 rounded bg-tavern-umber text-tavern-gold hover:bg-tavern-umber/80 border border-tavern-amber/40 transition-colors"
                  >
                    Standard Array Preset
                  </button>
                </div>
              </div>

              {/* Stat Grid with Plus/Minus buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((stat) => {
                  const base = baseStats[stat];
                  const racial = activeRace.bonuses[stat] || 0;
                  const total = base + racial;
                  const mod = getStatModifier(total);
                  const canIncrease = base < 15 && (POINT_BUY_COSTS[base + 1] - POINT_BUY_COSTS[base] <= pointsRemaining);
                  const canDecrease = base > 8;

                  return (
                    <div
                      key={stat}
                      className="p-2.5 rounded-lg bg-tavern-darkest/90 border border-tavern-amber/40 flex flex-col justify-between text-center space-y-1"
                    >
                      <div className="text-[11px] font-cinzel font-bold text-tavern-gold">{stat}</div>
                      <div className="text-lg font-bold text-tavern-parchment">{total}</div>
                      <div className="text-[11px] font-mono text-tavern-glow font-bold">{mod}</div>
                      <div className="text-[9px] text-tavern-parchment/50 font-sans">
                        Base {base} {racial > 0 ? `+ ${racial} race` : ''}
                      </div>

                      {/* Increment / Decrement controls */}
                      <div className="flex items-center justify-center gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => handleStatChange(stat, -1)}
                          disabled={!canDecrease}
                          className="w-6 h-6 rounded bg-tavern-wood hover:bg-tavern-umber text-tavern-gold border border-tavern-amber/30 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed text-xs transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatChange(stat, 1)}
                          disabled={!canIncrease}
                          className="w-6 h-6 rounded bg-tavern-wood hover:bg-tavern-umber text-tavern-gold border border-tavern-amber/30 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed text-xs transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CHARACTER DETAILS, APPEARANCE & PORTRAIT SECTION */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
          {/* Left: Input details */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Name Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider">
                  Hero Name
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeName}
                  className="text-[10px] font-cinzel text-tavern-gold hover:text-tavern-glow flex items-center gap-1 transition-colors"
                >
                  <Shuffle className="w-3 h-3" /> Inspire Name
                </button>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kaelen Sunstride"
                className="w-full px-3.5 py-2.5 bg-tavern-darkest/90 border border-tavern-amber/60 rounded-lg text-tavern-parchment text-sm focus:border-tavern-glow focus:outline-none"
              />
            </div>

            {/* Custom Appearance Description & Live Render */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider">
                  Appearance Description
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeAppearance}
                  className="text-[10px] font-cinzel text-tavern-gold hover:text-tavern-glow flex items-center gap-1 transition-colors"
                >
                  <Shuffle className="w-3 h-3" /> Inspire Look
                </button>
              </div>
              <textarea
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                rows={2}
                placeholder="Describe your hero's physical look, eyes, armor, cloak, scars, gear..."
                className="w-full px-3.5 py-2 bg-tavern-darkest/90 border border-tavern-amber/60 rounded-lg text-tavern-parchment text-sm focus:border-tavern-glow focus:outline-none resize-none font-sans"
              />
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-tavern-parchment/60 font-sans">
                  AI will paint your portrait based on this description
                </span>
                <button
                  type="button"
                  onClick={handleManualRender}
                  disabled={isGeneratingPortrait}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-tavern-amber to-tavern-gold hover:brightness-110 text-tavern-darkest font-cinzel font-bold text-xs shadow-candle flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0 active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPortrait ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingPortrait ? 'Painting Portrait...' : 'Render Art'}</span>
                </button>
              </div>
            </div>

            {/* Backstory Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider">
                  Origin & Backstory
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeBackstory}
                  className="text-[10px] font-cinzel text-tavern-gold hover:text-tavern-glow flex items-center gap-1 transition-colors"
                >
                  <Shuffle className="w-3 h-3" /> Inspire Backstory
                </button>
              </div>
              <textarea
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                rows={2}
                placeholder="What drove you to seek adventure at The Wayward Flagon?"
                className="w-full px-3.5 py-2 bg-tavern-darkest/90 border border-tavern-amber/60 rounded-lg text-tavern-parchment text-sm focus:border-tavern-glow focus:outline-none resize-none font-sans"
              />
            </div>

            {/* Starting Gear & Features Preview */}
            <div className="p-3.5 rounded-xl bg-tavern-wood/90 border border-tavern-amber/40 text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-tavern-amber/20 pb-1.5">
                <div className="font-cinzel font-bold text-tavern-gold uppercase text-[11px]">
                  Starting Equipment & Features
                </div>
                {creationMode === 'custom' && (
                  <span className="text-[10px] text-tavern-parchment/60 font-mono">
                    {activeRace.name} • {activeClass.name}
                  </span>
                )}
              </div>

              {/* Items / Inventory list */}
              <div className="space-y-1">
                <span className="text-[10px] font-cinzel text-tavern-gold/80 block uppercase">Inventory & Trinkets</span>
                <div className="flex flex-wrap gap-1.5">
                  {(creationMode === 'archetype' ? activeArchetype.inventory : activeClass.defaultInventory).map(
                    (item, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-tavern-darkest/90 border border-tavern-amber/40 text-tavern-parchment/90 text-[10px]"
                      >
                        {item}
                      </span>
                    )
                  )}
                  {creationMode === 'custom' && activeRace.racialTrinket && (
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-200 text-[10px] font-medium flex items-center gap-1">
                      <span>✨</span>
                      <span>{activeRace.racialTrinket}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Features & Abilities */}
              <div className="space-y-1 pt-1 border-t border-tavern-amber/20">
                <span className="text-[10px] font-cinzel text-tavern-glow/90 block uppercase">Class & Ancestry Features</span>
                <div className="flex flex-wrap gap-1.5">
                  {(creationMode === 'archetype' ? activeArchetype.abilities : activeClass.abilities).map(
                    (ability, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-stone-900 border border-tavern-glow/40 text-tavern-glow text-[10px] font-sans"
                      >
                        ⚡ {ability}
                      </span>
                    )
                  )}
                  {creationMode === 'custom' && activeRace.trait && (
                    <span className="px-2 py-0.5 rounded bg-stone-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-sans">
                      🧬 {activeRace.trait}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Character Card & Portrait Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-tavern-wood/90 border-2 border-tavern-gold/40 shadow-candle space-y-3.5">
            <div className="flex flex-col items-center text-center space-y-2.5">
              <PortraitDisplay
                portraitUrl={portraitUrl}
                characterClass={characterClassName}
                name={name}
                size="lg"
                isLoading={isGeneratingPortrait}
              />
              <div>
                <h4 className="font-cinzel font-bold text-lg text-tavern-glow">{name || 'Valiant Hero'}</h4>
                <p className="text-xs text-tavern-gold font-sans">
                  {characterClassName}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs font-mono text-tavern-parchment/90 mt-1">
                  <span className="flex items-center gap-1 text-red-400">
                    <Heart className="w-3.5 h-3.5 fill-red-400" /> {calculatedMaxHp} Max HP
                  </span>
                  <span className="flex items-center gap-1 text-tavern-glow">
                    <Coins className="w-3.5 h-3.5 text-tavern-gold" />{' '}
                    {creationMode === 'archetype' ? activeArchetype.gold : activeClass.startingGold}g
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Stats Summary */}
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(finalStats).map(([stat, val]) => (
                <div
                  key={stat}
                  className="bg-tavern-darkest/80 border border-tavern-amber/30 rounded-lg p-1.5 text-center"
                >
                  <div className="text-[9px] font-cinzel text-tavern-gold font-bold">{stat}</div>
                  <div className="text-xs font-bold text-tavern-parchment">{val}</div>
                  <div className="text-[9px] font-mono text-tavern-glow">{getStatModifier(val)}</div>
                </div>
              ))}
            </div>

            {/* Submit & Choose Campaign Button */}
            <button
              onClick={handleCreateHero}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-sm sm:text-base shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-tavern-darkest" />
              <span>Forge Hero & Choose Destiny</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
