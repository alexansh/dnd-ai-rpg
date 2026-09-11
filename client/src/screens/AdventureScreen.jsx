import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Home, Dices, Flame, Sparkles, MapPin, Award, ArrowLeft, Coins, Gift, Eye, Compass, UserPlus, Heart, Swords } from 'lucide-react';
import NarrativeLog from '../components/NarrativeLog';
import QuickActionChips from '../components/QuickActionChips';
import CharacterSheet from '../components/CharacterSheet';
import PartyBar from '../components/PartyBar';
import SceneIllustration from '../components/SceneIllustration';
import WorldMap2D from '../components/WorldMap2D';
import DiceRollerModal from '../components/DiceRollerModal';
import CampRestModal from '../components/CampRestModal';
import { narrateAction, generateSceneIllustration } from '../services/api';
import { SCENES } from '../constants/scenes';
import { COMPANIONS_POOL } from '../constants/companions';
import { useGame } from '../context/GameContext';
import { soundFx } from '../services/audio';

export default function AdventureScreen() {
  const {
    character,
    setCharacter,
    companions,
    setCompanions,
    activeCampaign,
    activeWorldNode,
    setActiveWorldNode,
    travelToWorldNode,
    activeQuest,
    currentLocation,
    setCurrentLocation,
    currentSceneKey,
    adventureLog,
    setAdventureLog,
    storySummary,
    setStorySummary,
    turnCount,
    setTurnCount,
    worldState,
    setWorldState,
    pendingCheck,
    setPendingCheck,
    quickActions,
    setQuickActions,
    activeTacticalBonus,
    setActiveTacticalBonus,
    recruitCompanion,
    adjustCompanionApproval,
    performCampRest,
    useTacticalSkill,
    returnToTavern,
    saveGame
  } = useGame();

  const [viewMode, setViewMode] = useState('narrative'); // 'narrative' | 'world_map'
  const [isLoading, setIsLoading] = useState(false);
  const [sceneImageUrl, setSceneImageUrl] = useState(null);
  const [isSceneLoading, setIsSceneLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState('calm');
  const [toastNotification, setToastNotification] = useState(null);
  const [isCampOpen, setIsCampOpen] = useState(false);
  const [discoveredHotspots, setDiscoveredHotspots] = useState([]);

  const sceneData = SCENES[currentSceneKey] || SCENES.crypt;

  // Spawns/Hotspots for current campaign & world node
  const activeHotspots = activeCampaign?.hotspots || [
    { id: 'ancient_chest', label: 'Rune-Carved Chest', type: 'chest', check: 'DEX', dc: 12, inspect: 'Heavy iron chest with ancient seals.' },
    { id: 'glowing_altar', label: 'Eldritch Altar', type: 'altar', check: 'INT', dc: 13, inspect: 'Pulsing arcane glyphs carved into granite.' }
  ];

  // Show floating toast
  const triggerToast = (text, type = 'loot') => {
    setToastNotification({ text, type, id: Date.now() });
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Asynchronous non-blocking scene illustration fetcher
  const updateSceneArt = async (hint, loc, mood) => {
    setIsSceneLoading(true);
    try {
      const res = await generateSceneIllustration({
        sceneDescription: hint || `The dark corridors of ${loc}`,
        location: loc,
        mood
      });
      if (res?.imageUrl) {
        setSceneImageUrl(res.imageUrl);
      }
    } catch (e) {
      console.warn('Failed to fetch scene art:', e);
    } finally {
      setIsSceneLoading(false);
    }
  };

  // Initial scene art generation on quest entry
  useEffect(() => {
    const initialMood = activeCampaign?.initialMood || 'exploration_wonder';
    soundFx.setMood(initialMood);
    soundFx.setIntensity(activeCampaign?.initialIntensity || 2);
    updateSceneArt(activeQuest?.initialNarration || activeCampaign?.description, currentLocation, 'calm');
  }, []);

  // Send action to DM engine
  const handlePlayerAction = async (actionText, actionType = 'custom', checkResult = null) => {
    if (isLoading) return;

    // 1. Add player action message to log
    if (!checkResult) {
      const playerMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: actionText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAdventureLog(prev => [...prev, playerMsg]);
    } else {
      const checkMsg = {
        id: `check-${Date.now()}`,
        role: 'system',
        content: `🎲 ${checkResult.ability} Check: Rolled ${checkResult.total} (D20: ${checkResult.d20} ${checkResult.mod >= 0 ? '+' : ''}${checkResult.mod}${activeTacticalBonus ? ` +${activeTacticalBonus.bonus} [${activeTacticalBonus.companionName}'s Assist]` : ''}) vs DC ${checkResult.dc} — ${checkResult.isSuccess ? 'SUCCESS' : 'FAILURE'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAdventureLog(prev => [...prev, checkMsg]);
      // Reset active tactical bonus after consuming in check
      setActiveTacticalBonus(null);
    }

    setIsLoading(true);

    try {
      const response = await narrateAction({
        character,
        companions,
        action: actionText,
        actionType,
        quest: activeQuest || { title: activeCampaign?.title || 'Chronicle Expedition', location: currentLocation },
        location: currentLocation,
        checkResult,
        history: adventureLog.map(m => ({
          role: m.role,
          content: m.content,
          companionName: m.companionName
        })),
        storySummary,
        worldState
      });

      // 2. Pocket Bard Reactive Transitions
      const isCombat = response.storyBeat === 'COMBAT' || Boolean(response.check?.reason?.toLowerCase().includes('attack') || response.check?.reason?.toLowerCase().includes('combat'));
      const isBoss = response.storyBeat === 'BOSS';
      const derivedMood = isCombat ? 'tense' : (isBoss ? 'ominous' : 'calm');
      setCurrentMood(derivedMood);

      if (isBoss) {
        soundFx.setMood('boss_epic');
        soundFx.setIntensity(5);
        soundFx.triggerSting('sword_clash');
      } else if (isCombat) {
        soundFx.setMood('combat_clash');
        soundFx.setIntensity(4);
        soundFx.triggerSting('sword_clash');
      } else if (response.storyBeat === 'PUZZLE' || response.storyBeat === 'EXPLORATION') {
        soundFx.setMood('dungeon_suspense');
        soundFx.setIntensity(3);
      }

      // 3. Process HP / Gold / Loot state modifications
      let updatedChar = { ...character };
      if (response.hpChange) {
        updatedChar.hp = Math.max(0, Math.min(updatedChar.maxHp, updatedChar.hp + response.hpChange));
        if (response.hpChange < 0) {
          soundFx.playFailure();
          triggerToast(`${response.hpChange} HP`, 'damage');
        } else {
          soundFx.playSuccess(false);
          triggerToast(`+${response.hpChange} HP`, 'heal');
        }
      }
      if (response.goldChange) {
        updatedChar.gold = Math.max(0, updatedChar.gold + response.goldChange);
        triggerToast(`${response.goldChange >= 0 ? '+' : ''}${response.goldChange} Gold`, 'gold');
      }
      if (response.loot && response.loot.length > 0) {
        updatedChar.inventory = [...updatedChar.inventory, ...response.loot];
        soundFx.playSuccess(true);
        triggerToast(`Found: ${response.loot.join(', ')}`, 'loot');
      }
      setCharacter(updatedChar);

      // 4. Update world state
      if (response.worldState) {
        setWorldState(response.worldState);
      }

      // 5. Update location if changed
      if (response.location) {
        setCurrentLocation(response.location);
      }

      // 6. Update story summary
      if (response.summaryDelta) {
        setStorySummary(prev => (prev ? `${prev} ${response.summaryDelta}` : response.summaryDelta));
      }

      // 7. Add DM narrative beat to log
      const dmMsg = {
        id: `dm-${Date.now()}`,
        role: 'dm',
        content: response.narration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // 8. Add Companion Action beats & approval shifts
      const newEntries = [dmMsg];
      if (Array.isArray(response.companionActions)) {
        response.companionActions.forEach((compAct, idx) => {
          const compData = companions.find(c => c.name === compAct.name) || companions[idx] || { name: compAct.name, class: 'Ally', color: '#d4a574' };
          
          // Random contextual approval change if choice resonated
          if (Math.random() > 0.65) {
            const delta = Math.random() > 0.25 ? 5 : -3;
            adjustCompanionApproval(compData.id, delta);
            triggerToast(`${compData.name} ${delta > 0 ? 'Approves (+5)' : 'Disapproves (-3)'}`, delta > 0 ? 'approval' : 'damage');
          }

          newEntries.push({
            id: `comp-${Date.now()}-${idx}`,
            role: 'companion',
            companionName: compAct.name,
            companionClass: compData.class,
            companionColor: compData.color,
            content: compAct.action,
            dialogue: compAct.dialogue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        });
      }

      setAdventureLog(prev => [...prev, ...newEntries]);

      // 9. Asynchronously update scene illustration if hint provided
      if (response.sceneHint) {
        updateSceneArt(response.sceneHint, response.location || currentLocation, derivedMood);
      }

      // 10. Set next quick action chips
      if (response.quickActions && response.quickActions.length > 0) {
        setQuickActions(response.quickActions);
      }

      // 11. Check if DM calls for a dice roll
      if (response.check) {
        setPendingCheck({
          ...response.check,
          playerAction: actionText
        });
      } else {
        setPendingCheck(null);
      }

      setTurnCount(prev => prev + 1);
      saveGame(updatedChar, companions);
    } catch (err) {
      console.error('Adventure action failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollComplete = (rollOutcome) => {
    const actionIntent = pendingCheck?.playerAction || 'Skill Action';
    setPendingCheck(null);
    handlePlayerAction(actionIntent, 'check', rollOutcome);
  };

  const handleHotspotClick = (spot) => {
    soundFx.playClick();
    soundFx.triggerSting('stealth_whisper');
    handlePlayerAction(`I carefully approach and interact with the ${spot.label}. (${spot.inspect})`);
  };

  return (
    <div className="min-h-screen p-3 sm:p-5 candle-glow-bg flex flex-col justify-between relative overflow-hidden">
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            key={toastNotification.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full border shadow-candle-lg flex items-center gap-2 text-xs font-cinzel font-bold ${
              toastNotification.type === 'damage'
                ? 'bg-red-950/95 border-red-500 text-red-300'
                : toastNotification.type === 'heal'
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-300'
                : toastNotification.type === 'approval'
                ? 'bg-amber-950/95 border-amber-400 text-amber-300'
                : toastNotification.type === 'gold'
                ? 'bg-amber-950/95 border-tavern-glow text-tavern-glow'
                : 'bg-tavern-wood border-tavern-gold text-tavern-parchment'
            }`}
          >
            {toastNotification.type === 'gold' ? (
              <Coins className="w-4 h-4 text-tavern-glow" />
            ) : toastNotification.type === 'approval' ? (
              <Sparkles className="w-4 h-4 text-amber-300" />
            ) : (
              <Gift className="w-4 h-4 text-tavern-gold" />
            )}
            <span>{toastNotification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-3">
        {/* Top Adventure Status Bar */}
        <div className="flex items-center justify-between bg-tavern-wood/90 border border-tavern-amber/50 rounded-xl px-4 py-2.5 shadow-candle">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <MapPin className="w-5 h-5 text-tavern-glow shrink-0 animate-pulse" />
            <div className="min-w-0">
              <h2 className="font-cinzel font-bold text-sm sm:text-base text-tavern-glow truncate">
                {currentLocation || activeWorldNode?.name || 'World Expedition'}
              </h2>
              <p className="text-[11px] text-tavern-gold font-sans truncate">
                {activeCampaign ? `${activeCampaign.title} • Stage ${worldState.questStage || 1} of ${worldState.totalStages || 4}` : (activeQuest?.title || 'Exploring')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* View Mode Toggle: Scene Illustration vs 2D World Map */}
            <div className="inline-flex p-0.5 bg-tavern-darkest/90 border border-tavern-amber/40 rounded-lg shadow-inner">
              <button
                onClick={() => { soundFx.playClick(); setViewMode('narrative'); }}
                className={`px-2.5 py-1 rounded text-[11px] font-cinzel font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'narrative'
                    ? 'bg-tavern-amber text-tavern-darkest shadow-sm'
                    : 'text-tavern-gold/70 hover:text-tavern-gold'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Scene</span>
              </button>
              <button
                onClick={() => { soundFx.playClick(); setViewMode('world_map'); }}
                className={`px-2.5 py-1 rounded text-[11px] font-cinzel font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'world_map'
                    ? 'bg-tavern-amber text-tavern-darkest shadow-sm'
                    : 'text-tavern-gold/70 hover:text-tavern-gold'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">2D Map</span>
              </button>
            </div>

            <button
              onClick={() => { soundFx.playClick(); setIsCampOpen(true); }}
              className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-200 font-cinzel font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-flicker" />
              <span>Camp</span>
            </button>

            <button
              onClick={() => returnToTavern(turnCount >= 3 || worldState.questStage >= 4)}
              className="px-3 py-1.5 rounded-lg bg-tavern-wood hover:bg-tavern-umber border border-tavern-amber/40 text-tavern-gold font-cinzel font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tavern</span>
            </button>
          </div>
        </div>

        {/* Party Bar with Tactical Skills and Camp Trigger */}
        <PartyBar
          player={character}
          companions={companions}
          onUseTacticalSkill={(comp) => useTacticalSkill(comp)}
          onOpenCamp={() => setIsCampOpen(true)}
        />

        {/* Main Adventure Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 h-[calc(100vh-210px)] min-h-[500px]">
          {/* Left Column: Dynamic Scene or 2D Map + AI DM Log & Input */}
          <div className="lg:col-span-8 flex flex-col h-full space-y-3 min-w-0">
            {viewMode === 'world_map' ? (
              <WorldMap2D
                campaign={activeCampaign}
                activeNode={activeWorldNode}
                onSelectNode={(node) => travelToWorldNode(node)}
                playerCharacter={character}
              />
            ) : (
              /* Dynamic AI Scene Illustration with Interactive Hotspots */
              <div className="relative">
                <SceneIllustration
                  sceneImageUrl={sceneImageUrl}
                  fallbackImageUrl={sceneData.imageUrl || sceneData.fallbackUrl}
                  fallbackGradient={sceneData.bgGradient}
                  location={currentLocation}
                  mood={currentMood}
                  isLoading={isSceneLoading}
                />

                {/* Interactive World Hotspot Chips */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap gap-2 z-10 pointer-events-auto">
                  {activeHotspots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => handleHotspotClick(spot)}
                      className="px-2.5 py-1 rounded-lg bg-stone-950/85 hover:bg-stone-900 border border-tavern-gold/60 hover:border-tavern-glow text-[11px] font-cinzel font-bold text-tavern-glow flex items-center gap-1.5 shadow-candle backdrop-blur-md active:scale-95 transition-all"
                    >
                      <Eye className="w-3 h-3 text-tavern-gold" />
                      <span>{spot.label}</span>
                      <span className="text-[9px] px-1 rounded bg-stone-800 text-stone-300 font-mono">
                        {spot.check}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Narrative Log Stream */}
            <NarrativeLog
              log={adventureLog}
              storySummary={storySummary}
              isLoading={isLoading}
            />

            {/* Quick Action Chips & Input Bar */}
            <QuickActionChips
              onAction={(act, type) => handlePlayerAction(act, type)}
              dynamicChips={quickActions}
              disabled={isLoading || Boolean(pendingCheck)}
            />
          </div>

          {/* Right Column: Character Sheet Panel */}
          <div className="lg:col-span-4 h-full overflow-y-auto">
            <CharacterSheet />
          </div>
        </div>
      </div>

      {/* D20 Check Modal Trigger */}
      {pendingCheck && (
        <DiceRollerModal
          check={pendingCheck}
          character={character}
          tacticalBonus={activeTacticalBonus}
          onRollComplete={handleRollComplete}
          onCancel={() => setPendingCheck(null)}
        />
      )}

      {/* Camp Rest & Dialogue Modal */}
      {isCampOpen && (
        <CampRestModal
          isOpen={isCampOpen}
          onClose={() => setIsCampOpen(false)}
          party={companions}
          playerCharacter={character}
          onTakeRest={(type) => performCampRest(type)}
          onCompanionTalk={(compId, delta) => adjustCompanionApproval(compId, delta)}
        />
      )}
    </div>
  );
}
