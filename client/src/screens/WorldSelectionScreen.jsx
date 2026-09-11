import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  Sword,
  Shield,
  Compass,
  MapPin,
  Flame,
  ArrowRight,
  ArrowLeft,
  Wand2,
  RefreshCw,
  Skull,
  Users,
  CheckCircle2,
  Shuffle,
  Eye,
  Crosshair
} from 'lucide-react';
import { CAMPAIGN_PRESETS } from '../constants/campaigns';
import { useGame } from '../context/GameContext';
import PortraitDisplay from '../components/PortraitDisplay';
import { soundFx } from '../services/audio';

const AI_PROMPT_PRESETS = [
  'Sunken abyssal empire ruled by ancient leviathans and coral cultists',
  'Floating sky-islands besieged by clockwork dragons and storm mages',
  'Frozen obsidian tundra where an immortal frost giant king hoards the sun',
  'Haunted desert necropolis guarding the lost pyramid of the Star Pharaoh',
  'Cursed clockwork cathedral where rogue automatons forge eldritch gods',
  'Blighted ironwood forest infested by fungal parasite swarms and shadow beasts'
];

const THEME_OPTIONS = [
  { id: 'Gothic Catacombs', label: 'Gothic Catacombs', icon: '💀', desc: 'Undead crypts, blood altars & shadow' },
  { id: 'Volcanic Crags', label: 'Volcanic Crags', icon: '🌋', desc: 'Dragon roosts, magma vents & ash peaks' },
  { id: 'Enchanted Feywild', label: 'Enchanted Feywild', icon: '🍄', desc: 'Archfey courts, illusions & starlight' },
  { id: 'Sunken Pirate Cove', label: 'Sunken Pirate Cove', icon: '🏴‍☠️', desc: 'Siren reefs, ghost galleons & cursed gold' },
  { id: 'Infernal Wastelands', label: 'Infernal Wastelands', icon: '🔥', desc: 'Hellfire engines, fiendish rifts & war' },
  { id: 'Urban Mystery', label: 'Urban Mystery', icon: '🕯️', desc: 'City syndicates, secret cults & back-alleys' }
];

export default function WorldSelectionScreen() {
  const { character, companions, launchWorldCampaign, setCurrentScreen } = useGame();

  const [activeTab, setActiveTab] = useState('chronicles'); // 'chronicles' | 'ai_forge'
  const [selectedCampaignId, setSelectedCampaignId] = useState(CAMPAIGN_PRESETS[0].id);

  // AI Forge State
  const [customPrompt, setCustomPrompt] = useState(AI_PROMPT_PRESETS[0]);
  const [selectedTheme, setSelectedTheme] = useState('Gothic Catacombs');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Balanced');
  const [isGeneratingWorld, setIsGeneratingWorld] = useState(false);
  const [generatedWorld, setGeneratedWorld] = useState(null);

  const activePreset = CAMPAIGN_PRESETS.find((c) => c.id === selectedCampaignId) || CAMPAIGN_PRESETS[0];

  const handleInspirePrompt = () => {
    soundFx.playClick();
    const random = AI_PROMPT_PRESETS[Math.floor(Math.random() * AI_PROMPT_PRESETS.length)];
    setCustomPrompt(random);
  };

  const handleGenerateWorld = async () => {
    soundFx.playClick();
    setIsGeneratingWorld(true);
    try {
      const res = await fetch('/api/dm/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: selectedTheme,
          promptInput: customPrompt,
          difficulty: selectedDifficulty,
          partyLevel: 1,
          partyComposition: [character?.class || 'Warrior', ...companions.map((c) => c.class)]
        })
      });
      if (res.ok) {
        const worldData = await res.json();
        setGeneratedWorld(worldData);
        soundFx.playSuccess(false);
      }
    } catch (e) {
      console.warn('AI world generation failed:', e);
    } finally {
      setIsGeneratingWorld(false);
    }
  };

  const handleEmbark = (worldToLaunch) => {
    soundFx.playClick();
    soundFx.playSuccess(false);
    launchWorldCampaign(worldToLaunch);
  };

  return (
    <div className="min-h-screen p-3 sm:p-6 candle-glow-bg overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-tavern-amber/40 pb-3 gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              setCurrentScreen('create');
            }}
            className="flex items-center gap-1.5 text-xs font-cinzel text-tavern-gold hover:text-tavern-glow transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hero Forge
          </button>

          <div className="text-center sm:text-center flex-1">
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-tavern-glow flex items-center justify-center gap-2">
              <Globe className="w-6 h-6 text-tavern-gold" />
              <span>World & Campaign Hub</span>
            </h2>
            <p className="text-xs text-tavern-parchment/70 font-sans">
              Choose an authored chronicle world or forge a brand-new 2D realm with AI
            </p>
          </div>

          {/* Hero Quick Badge */}
          {character && (
            <div className="flex items-center gap-2.5 bg-tavern-wood/90 border border-tavern-amber/40 rounded-xl px-3 py-1.5 shadow-sm">
              <PortraitDisplay
                portraitUrl={character.portraitUrl}
                characterClass={character.class}
                name={character.name}
                size="sm"
              />
              <div className="text-left">
                <div className="text-xs font-cinzel font-bold text-tavern-glow leading-tight">{character.name}</div>
                <div className="text-[10px] text-tavern-gold font-sans">{character.race} • {character.class}</div>
              </div>
            </div>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-tavern-darkest/90 border border-tavern-amber/40 rounded-xl shadow-candle">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('chronicles');
              }}
              className={`px-6 py-2.5 rounded-lg font-cinzel font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'chronicles'
                  ? 'bg-gradient-to-r from-tavern-amber to-tavern-gold text-tavern-darkest shadow-sm'
                  : 'text-tavern-gold/70 hover:text-tavern-gold'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Chronicle Worlds</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab('ai_forge');
              }}
              className={`px-6 py-2.5 rounded-lg font-cinzel font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === 'ai_forge'
                  ? 'bg-gradient-to-r from-tavern-amber to-tavern-gold text-tavern-darkest shadow-sm'
                  : 'text-tavern-gold/70 hover:text-tavern-gold'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Forge New World with AI</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: CHRONICLE WORLDS (HANDCRAFTED SAGAS) */}
        {/* ========================================================= */}
        {activeTab === 'chronicles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: World List Cards */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Select Chronicle Saga
              </h3>
              <div className="space-y-2.5">
                {CAMPAIGN_PRESETS.map((camp) => {
                  const isSelected = camp.id === selectedCampaignId;
                  return (
                    <button
                      key={camp.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedCampaignId(camp.id);
                      }}
                      className={`w-full p-3.5 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-tavern-umber/90 border-tavern-glow shadow-candle ring-1 ring-tavern-gold scale-[1.01]'
                          : 'bg-tavern-wood/70 border-tavern-amber/30 hover:border-tavern-gold/60 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-cinzel font-bold text-base text-tavern-glow">{camp.title}</div>
                          <div className="text-xs text-tavern-gold font-sans">{camp.subtitle}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-tavern-darkest/90 border border-tavern-amber/50 text-[10px] font-mono text-tavern-parchment uppercase">
                          {camp.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-tavern-parchment/80 font-sans line-clamp-2">{camp.description}</p>
                      <div className="flex items-center gap-4 text-[10px] text-tavern-gold/70 pt-1 font-mono">
                        <span>🗺️ {camp.startingNodes?.length || 4} Map Nodes</span>
                        <span>👥 {camp.companionSpawns?.length || 3} Companions</span>
                        <span>⚔️ {camp.recommendedLevel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected World Map & Bible Preview */}
            <div className="lg:col-span-6 space-y-4 p-4 rounded-2xl bg-tavern-wood/90 border-2 border-tavern-gold/40 shadow-candle">
              <div className="relative rounded-xl overflow-hidden aspect-video border border-tavern-amber/50 shadow-inner">
                <img
                  src={activePreset.bgImage}
                  alt={activePreset.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tavern-darkest via-tavern-darkest/40 to-transparent p-4 flex flex-col justify-end">
                  <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-amber-200 text-[10px] font-bold w-fit uppercase mb-1">
                    {activePreset.environment.toUpperCase()} BIOME
                  </span>
                  <h3 className="text-xl font-cinzel font-bold text-tavern-glow">{activePreset.title}</h3>
                  <p className="text-xs text-tavern-parchment/90 line-clamp-2">{activePreset.mainQuest}</p>
                </div>
              </div>

              {/* World Lore & Nemesis */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-tavern-darkest/80 border border-tavern-amber/30">
                  <span className="text-[10px] font-cinzel text-red-400 font-bold block uppercase">Nemesis</span>
                  <span className="font-bold text-tavern-parchment">{activePreset.mainNemesis || 'Shadow Sovereign'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-tavern-darkest/80 border border-tavern-amber/30">
                  <span className="text-[10px] font-cinzel text-tavern-gold font-bold block uppercase">Reward</span>
                  <span className="font-bold text-tavern-glow">{activePreset.rewardGold}g • {activePreset.rewardItem}</span>
                </div>
              </div>

              {/* 3-Act Structure Preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider block">
                  Campaign Act Progression (Baldur's Gate 3 Style)
                </span>
                <div className="space-y-1.5">
                  {(activePreset.acts || []).map((act, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-tavern-darkest/60 border border-tavern-amber/20 flex items-center justify-between text-xs"
                    >
                      <span className="font-cinzel font-bold text-tavern-glow">{act.name}</span>
                      <span className="text-[11px] text-tavern-parchment/70 font-sans">{act.objective}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2D Interactive World Map Nodes Mini Preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider block">
                  2D World Node Network
                </span>
                <div className="relative h-28 bg-stone-950/90 rounded-xl border border-tavern-amber/40 p-2 overflow-hidden flex items-center justify-around">
                  {(activePreset.startingNodes || []).map((node, i) => (
                    <div key={node.id} className="flex flex-col items-center text-center z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                          node.type === 'boss'
                            ? 'bg-red-900 border-2 border-red-400 text-red-100 animate-pulse'
                            : node.unlocked
                            ? 'bg-amber-600 border-2 border-amber-300 text-amber-950'
                            : 'bg-stone-800 border border-stone-600 text-stone-400'
                        }`}
                      >
                        {node.type === 'boss' ? '💀' : node.type === 'shrine' ? '✨' : node.type === 'outpost' ? '🏰' : '⚔️'}
                      </div>
                      <span className="text-[9px] font-cinzel font-bold text-tavern-parchment mt-1 max-w-[70px] truncate">
                        {node.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Embark Button */}
              <button
                onClick={() => handleEmbark(activePreset)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-base shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Embark into {activePreset.title}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: AI WORLD FORGE (CUSTOM GENERATION) */}
        {/* ========================================================= */}
        {activeTab === 'ai_forge' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: AI Prompt & Parameter Builder */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider">
                    Custom World Lore Prompt
                  </label>
                  <button
                    type="button"
                    onClick={handleInspirePrompt}
                    className="text-[10px] font-cinzel text-tavern-gold hover:text-tavern-glow flex items-center gap-1 transition-colors"
                  >
                    <Shuffle className="w-3 h-3" /> Inspire Prompt
                  </button>
                </div>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  placeholder="Describe your desired fantasy world, crisis, ancient evils, factions..."
                  className="w-full px-3.5 py-2.5 bg-tavern-darkest/90 border border-tavern-amber/60 rounded-lg text-tavern-parchment text-sm focus:border-tavern-glow focus:outline-none resize-none font-sans"
                />
              </div>

              {/* Theme & Biome Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider">
                  Select Realm Biome & Environment
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((theme) => {
                    const isSelected = theme.id === selectedTheme;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedTheme(theme.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-tavern-umber border-tavern-glow shadow-candle ring-1 ring-tavern-gold'
                            : 'bg-tavern-wood/70 border-tavern-amber/30 hover:border-tavern-gold/60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-base">
                          <span>{theme.icon}</span>
                          <span className="font-cinzel font-bold text-xs text-tavern-glow">{theme.label}</span>
                        </div>
                        <p className="text-[10px] text-tavern-parchment/60 font-sans mt-0.5 line-clamp-1">{theme.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider">
                  Campaign Difficulty Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Story Mode', 'Balanced', 'Tactician'].map((diff) => {
                    const isSelected = diff === selectedDifficulty;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedDifficulty(diff);
                        }}
                        className={`py-2 px-3 rounded-lg border text-center font-cinzel text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-tavern-umber border-tavern-glow text-tavern-glow shadow-sm'
                            : 'bg-tavern-wood/60 border-tavern-amber/30 text-tavern-parchment/70 hover:text-tavern-gold'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerateWorld}
                disabled={isGeneratingWorld}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-tavern-amber to-tavern-gold hover:brightness-110 text-tavern-darkest font-cinzel font-bold text-sm shadow-candle flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingWorld ? 'animate-spin' : ''}`} />
                <span>{isGeneratingWorld ? 'Weaving World & 2D Map with AI...' : 'Forge World with AI'}</span>
              </button>
            </div>

            {/* Right: AI Generated World Preview */}
            <div className="lg:col-span-6 space-y-4 p-4 rounded-2xl bg-tavern-wood/90 border-2 border-tavern-gold/40 shadow-candle min-h-[420px] flex flex-col justify-between">
              {isGeneratingWorld ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <Sparkles className="w-12 h-12 text-tavern-gold animate-spin" />
                  <h4 className="font-cinzel font-bold text-lg text-tavern-glow">Weaving World Lore & 2D Map...</h4>
                  <p className="text-xs text-tavern-parchment/70 font-sans max-w-sm">
                    The Dungeon Master is generating 3-act narrative arcs, faction dynamics, boss fortresses, and tactical road nodes.
                  </p>
                </div>
              ) : generatedWorld ? (
                <div className="space-y-3.5">
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-tavern-amber/50 shadow-inner">
                    <img
                      src={generatedWorld.bgImage || '/assets/images/scenery/crypt.jpg'}
                      alt={generatedWorld.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tavern-darkest via-tavern-darkest/40 to-transparent p-4 flex flex-col justify-end">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-[10px] font-bold w-fit uppercase mb-1">
                        ✨ AI CUSTOM FORGED WORLD
                      </span>
                      <h3 className="text-xl font-cinzel font-bold text-tavern-glow">{generatedWorld.title}</h3>
                      <p className="text-xs text-tavern-parchment/90 line-clamp-2">{generatedWorld.mainQuest}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-tavern-darkest/80 border border-tavern-amber/30">
                      <span className="text-[10px] font-cinzel text-red-400 font-bold block uppercase">Nemesis</span>
                      <span className="font-bold text-tavern-parchment">{generatedWorld.mainNemesis || 'Unknown Evil'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-tavern-darkest/80 border border-tavern-amber/30">
                      <span className="text-[10px] font-cinzel text-tavern-gold font-bold block uppercase">Reward</span>
                      <span className="font-bold text-tavern-glow">{generatedWorld.rewardGold}g • {generatedWorld.rewardItem}</span>
                    </div>
                  </div>

                  {/* 3-Act Structure */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-cinzel font-bold text-tavern-gold uppercase tracking-wider block">
                      3-Act Narrative Arc
                    </span>
                    <div className="space-y-1">
                      {(generatedWorld.acts || []).map((act, i) => (
                        <div
                          key={i}
                          className="p-1.5 px-2 rounded bg-tavern-darkest/60 border border-tavern-amber/20 flex items-center justify-between text-xs"
                        >
                          <span className="font-cinzel font-bold text-tavern-glow">{act.name}</span>
                          <span className="text-[11px] text-tavern-parchment/70 font-sans">{act.objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleEmbark(generatedWorld)}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-tavern-amber via-tavern-gold to-tavern-glow text-tavern-darkest font-cinzel font-bold text-base shadow-candle hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Embark into AI World</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <Wand2 className="w-12 h-12 text-tavern-gold/50" />
                  <h4 className="font-cinzel font-bold text-base text-tavern-parchment/80">
                    Ready to Forge Your Custom World
                  </h4>
                  <p className="text-xs text-tavern-parchment/60 font-sans max-w-sm">
                    Customize your lore prompt and theme on the left, then click "Forge World with AI" to generate a complete Baldur's Gate 3-style adventure.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
