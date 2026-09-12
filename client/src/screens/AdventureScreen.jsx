import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Home, Dices, Flame, Sparkles, MapPin, Award, ArrowLeft, Coins, Gift, Eye, Compass, UserPlus, Users, Heart, Swords, BookOpen, Package, Layers } from 'lucide-react';
import NarrativeLog from '../components/NarrativeLog';
import QuickActionChips from '../components/QuickActionChips';
import DecisionMatrix from '../components/DecisionMatrix';
import CharacterSheet from '../components/CharacterSheet';
import PartyBar from '../components/PartyBar';
import SceneIllustration from '../components/SceneIllustration';
import Scene2DView from '../components/Scene2DView';
import WorldMap2D from '../components/WorldMap2D';
import DungeonNodeMap from '../components/DungeonNodeMap';
import EncounterBar from '../components/EncounterBar';
import DiceRollerModal from '../components/DiceRollerModal';
import CampRestModal from '../components/CampRestModal';
import CodexModal from '../components/CodexModal';
import LootCardModal from '../components/LootCardModal';
import { narrateAction, generateSceneIllustration, fetchMonsterData } from '../services/api';
import { applyDeterministicStateMutation } from '../services/deterministicRunner';
import { SCENES } from '../constants/scenes';
import { COMPANIONS_POOL } from '../constants/companions';
import { useGame } from '../context/GameContext';
import { soundFx } from '../services/audio';
import { voiceEngine } from '../services/voiceEngine';

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
    codexEntries,
    unlockCodexEntry,
    undoStack,
    pushHistorySnapshot,
    undoLastTurn,
    editLogEntry,
    activeMonsters,
    setActiveMonsters,
    turnOrder,
    setTurnOrder,
    currentCombatTurn,
    setCurrentCombatTurn,
    combatPosition,
    setCombatPosition,
    recruitCompanion,
    adjustCompanionApproval,
    performCampRest,
    useTacticalSkill,
    returnToTavern,
    saveGame,
    saveCurrentSlot,
    setCurrentScreen
  } = useGame();

  const [viewMode, setViewMode] = useState('narrative'); // 'narrative' | 'world_map' | 'dungeon_map'
  const [isLoading, setIsLoading] = useState(false);
  const [sceneImageUrl, setSceneImageUrl] = useState(null);
  const [isSceneLoading, setIsSceneLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState('calm');
  const [toastNotification, setToastNotification] = useState(null);
  const [isCampOpen, setIsCampOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [inspectedItem, setInspectedItem] = useState(null);
  const [lastActionSent, setLastActionSent] = useState(null);

  const sceneData = SCENES[currentSceneKey] || SCENES.crypt;

  // Active Scene Node from active campaign or fallback
  const currentNode = activeWorldNode || activeCampaign?.nodes?.[0] || activeCampaign?.startingNodes?.[0] || {
    id: 'current_scene',
    title: currentLocation || 'The Road Ahead',
    act: 1,
    description: activeQuest?.description || 'You stand ready on the frontier of adventure.',
    lightingMood: currentMood,
    hotspots: activeCampaign?.hotspots || [
      { id: 'ancient_chest', label: 'Rune-Carved Chest', type: 'chest', check: 'DEX', dc: 12, inspect: 'Heavy iron chest with ancient seals.' },
      { id: 'glowing_altar', label: 'Eldritch Altar', type: 'altar', check: 'INT', dc: 13, inspect: 'Pulsing arcane glyphs carved into granite.' }
    ],
    choices: []
  };

  const activeHotspots = currentNode?.hotspots || activeCampaign?.hotspots || [];

  const triggerToast = (text, type = 'loot') => {
    setToastNotification({ text, type, id: Date.now() });
    setTimeout(() => setToastNotification(null), 3000);
  };

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

  useEffect(() => {
    const initialMood = activeCampaign?.initialMood || 'exploration_wonder';
    soundFx.setMood(initialMood);
    soundFx.setIntensity(activeCampaign?.initialIntensity || 2);
    updateSceneArt(activeQuest?.initialNarration || activeCampaign?.description, currentLocation, 'calm');
  }, []);

  // Main DM Turn Handler
  const handlePlayerAction = async (actionText, actionType = 'do', checkResult = null) => {
    if (isLoading) return;

    // Save snapshot to history stack before executing state change
    pushHistorySnapshot();
    setLastActionSent({ actionText, actionType });

    // 1. Add player action message to log
    if (!checkResult) {
      const playerMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        actionMode: actionType,
        content: actionText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAdventureLog(prev => [...prev, playerMsg]);
    } else {
      const checkMsg = {
        id: `check-${Date.now()}`,
        role: 'system',
        content: `🎲 ${checkResult.ability} Check: Rolled ${checkResult.total} (${checkResult.rollMode.toUpperCase()}: D20 ${checkResult.d20} ${checkResult.mod >= 0 ? '+' : ''}${checkResult.mod}${activeTacticalBonus ? ` +${activeTacticalBonus.bonus} [${activeTacticalBonus.companionName}'s Assist]` : ''}) vs DC ${checkResult.dc} — ${checkResult.isSuccess ? 'SUCCESS' : 'FAILURE'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAdventureLog(prev => [...prev, checkMsg]);
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

      // 2. Audio & Mood Transitions
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

      // 3. Combat Encounter State Sync
      if (isCombat && activeMonsters.length === 0) {
        const monsterName = activeCampaign?.monsters?.[0] || 'Goblin Raider';
        const defaultMonster = {
          id: `mob-${Date.now()}`,
          name: monsterName,
          ac: 14,
          hp: 18,
          maxHp: 18,
          conditions: []
        };
        setActiveMonsters([defaultMonster]);

        const initiativeList = [
          { name: character?.name || 'Hero', initiative: 18, isPlayer: true },
          { name: companions[0]?.name || 'Companion 1', initiative: 14 },
          { name: monsterName, initiative: 11 },
          { name: companions[1]?.name || 'Companion 2', initiative: 8 }
        ];
        setTurnOrder(initiativeList);
      } else if (!isCombat && response.storyBeat !== 'BOSS' && activeMonsters.length > 0) {
        setActiveMonsters([]);
      }

      // 4. Process HP / Gold / Loot
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
        triggerToast(`Discovered: ${response.loot.join(', ')}`, 'loot');
      }
      setCharacter(updatedChar);

      // 5. World State & Location
      if (response.worldState) setWorldState(response.worldState);
      if (response.location) setCurrentLocation(response.location);
      if (response.summaryDelta) {
        setStorySummary(prev => (prev ? `${prev} ${response.summaryDelta}` : response.summaryDelta));
      }

      // 6. DM Message & Voice TTS
      const dmMsg = {
        id: `dm-${Date.now()}`,
        role: 'dm',
        content: response.narration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (voiceEngine.getEnabled()) {
        voiceEngine.speak(response.narration);
      }

      // 7. Companion Action & Affinity shifts
      const newEntries = [dmMsg];
      if (Array.isArray(response.companionActions)) {
        response.companionActions.forEach((compAct, idx) => {
          const compData = companions.find(c => c.name === compAct.name) || companions[idx] || { name: compAct.name, class: 'Ally', color: '#d4a574' };
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

      // Process affinity changes
      if (Array.isArray(response.affinityChanges)) {
        response.affinityChanges.forEach(aff => {
          adjustCompanionApproval(aff.companion, aff.delta);
          triggerToast(`${aff.companion} ${aff.delta > 0 ? `Approves (+${aff.delta})` : `Disapproves (${aff.delta})`}`, aff.delta > 0 ? 'approval' : 'damage');
        });
      }

      // Process new codex discoveries
      if (Array.isArray(response.newCodexEntries) && response.newCodexEntries.length > 0) {
        response.newCodexEntries.forEach(entry => {
          unlockCodexEntry(entry);
          triggerToast(`Codex Entry Unlocked: ${entry.title}`, 'loot');
        });
      }

      setAdventureLog(prev => [...prev, ...newEntries]);

      if (response.sceneHint) {
        updateSceneArt(response.sceneHint, response.location || currentLocation, derivedMood);
      }

      if (response.quickActions && response.quickActions.length > 0) {
        setQuickActions(response.quickActions);
      }

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

  // Deterministic Choice Selection Handler
  const handleSelectDeterministicChoice = (choice) => {
    if (isLoading || pendingCheck) return;

    if (choice.check) {
      setPendingCheck({
        ...choice.check,
        choiceData: choice,
        playerAction: choice.text
      });
      return;
    }

    executeChoiceOutcome(choice, null);
  };

  // Deterministic Choice Mutation Executor
  const executeChoiceOutcome = async (choice, rollOutcome) => {
    pushHistorySnapshot();
    setLastActionSent({ actionText: choice.text, actionType: 'do' });

    const isSuccess = rollOutcome ? rollOutcome.isSuccess : true;
    const activeMutation = isSuccess
      ? (choice.successMutation || choice.mutation || {})
      : (choice.failureMutation || choice.mutation || {});

    // Apply pure deterministic state transitions
    const nextState = applyDeterministicStateMutation({
      character,
      companions,
      flags: worldState?.flags ? Object.keys(worldState.flags) : [],
      moralityScore: character.moralityScore || 0
    }, activeMutation);

    setCharacter(nextState.character);
    setCompanions(nextState.companions);

    const updatedFlags = { ...(worldState.flags || {}) };
    (nextState.flags || []).forEach(f => { updatedFlags[f] = true; });
    setWorldState(prev => ({
      ...prev,
      flags: updatedFlags,
      questStage: choice.targetNodeId ? (prev.questStage || 1) + 1 : (prev.questStage || 1)
    }));

    if (nextState.breakingCompanions && nextState.breakingCompanions.length > 0) {
      nextState.breakingCompanions.forEach(c => {
        triggerToast(`⚠️ ${c.name} has reached a breaking point!`, 'damage');
      });
    }

    if (activeMutation.loyaltyDeltas) {
      Object.entries(activeMutation.loyaltyDeltas).forEach(([id, delta]) => {
        const comp = companions.find(c => c.id === id || c.name === id);
        const name = comp?.name || id;
        triggerToast(`${name} ${delta > 0 ? `Approves (+${delta})` : `Disapproves (${delta})`}`, delta > 0 ? 'approval' : 'damage');
      });
    }

    let nextNode = null;
    if (choice.targetNodeId && activeCampaign?.nodes) {
      nextNode = activeCampaign.nodes.find(n => n.id === choice.targetNodeId);
      if (nextNode) {
        setActiveWorldNode(nextNode);
        setCurrentLocation(nextNode.title || nextNode.name);
      }
    }

    setIsLoading(true);
    try {
      const outcomeText = rollOutcome
        ? `[Action: "${choice.text}" - Rolled ${rollOutcome.total} vs DC ${rollOutcome.dc} (${isSuccess ? 'SUCCESS' : 'FAILURE'})]`
        : `[Player Choice: "${choice.text}"]`;

      const response = await narrateAction({
        character: nextState.character,
        companions: nextState.companions,
        action: outcomeText,
        actionType: 'do',
        quest: activeQuest || { title: activeCampaign?.title || 'Expedition', location: currentLocation },
        location: nextNode?.title || currentLocation,
        checkResult: rollOutcome,
        history: adventureLog.map(m => ({
          role: m.role,
          content: m.content,
          companionName: m.companionName
        })),
        storySummary,
        worldState: {
          ...worldState,
          flags: updatedFlags,
          currentNodeId: choice.targetNodeId || activeWorldNode?.id
        }
      });

      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        actionMode: 'do',
        content: choice.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const dmMsg = {
        id: `dm-${Date.now()}`,
        role: 'dm',
        content: response.narration || (isSuccess ? choice.resolution : choice.failureResolution) || 'The consequences ripple across your fellowship.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const newLogs = [userMsg, dmMsg];

      if (Array.isArray(response.companionActions)) {
        response.companionActions.forEach((compAct, idx) => {
          const compData = nextState.companions.find(c => c.name === compAct.name) || nextState.companions[idx] || { name: compAct.name, class: 'Ally', color: '#d4a574' };
          newLogs.push({
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

      setAdventureLog(prev => [...prev, ...newLogs]);

      if (voiceEngine.getEnabled() && dmMsg.content) {
        voiceEngine.speak(dmMsg.content);
      }

      if (response.quickActions && response.quickActions.length > 0) {
        setQuickActions(response.quickActions);
      }

      setTurnCount(prev => prev + 1);
      saveGame(nextState.character, nextState.companions);
    } catch (err) {
      console.error('Narrative resolution error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollComplete = (rollOutcome) => {
    const currentCheck = pendingCheck;
    setPendingCheck(null);

    if (currentCheck?.choiceData) {
      executeChoiceOutcome(currentCheck.choiceData, rollOutcome);
    } else {
      handlePlayerAction(currentCheck?.playerAction || 'Skill Action', 'check', rollOutcome);
    }
  };

  const handleRetryTurn = () => {
    if (!lastActionSent) return;
    undoLastTurn();
    setTimeout(() => {
      handlePlayerAction(lastActionSent.actionText, lastActionSent.actionType);
    }, 150);
  };

  const handleHotspotClick = (spot) => {
    soundFx.playClick();
    soundFx.triggerSting('stealth_whisper');
    if (spot.check) {
      setPendingCheck({
        ability: spot.check,
        dc: spot.dc || 12,
        reason: `Inspect & interact with ${spot.label}`,
        playerAction: `Inspect ${spot.label}: ${spot.inspect || ''}`
      });
    } else {
      handlePlayerAction(`I carefully approach and interact with the ${spot.label}. (${spot.inspect})`, 'do');
    }
  };

  const handleExecuteCombatAction = (actionDesc, type) => {
    handlePlayerAction(actionDesc, 'do');
    setCurrentCombatTurn(prev => (prev + 1) % Math.max(1, turnOrder.length));
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
            {/* View Mode Toggle */}
            <div className="inline-flex p-0.5 bg-tavern-darkest/90 border border-tavern-amber/40 rounded-lg shadow-inner">
              <button
                onClick={() => { soundFx.playClick(); setViewMode('narrative'); }}
                className={`px-2.5 py-1 rounded text-[11px] font-cinzel font-bold flex items-center gap-1 transition-all ${
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
                className={`px-2.5 py-1 rounded text-[11px] font-cinzel font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'world_map'
                    ? 'bg-tavern-amber text-tavern-darkest shadow-sm'
                    : 'text-tavern-gold/70 hover:text-tavern-gold'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">World</span>
              </button>
              <button
                onClick={() => { soundFx.playClick(); setViewMode('dungeon_map'); }}
                className={`px-2.5 py-1 rounded text-[11px] font-cinzel font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'dungeon_map'
                    ? 'bg-tavern-amber text-tavern-darkest shadow-sm'
                    : 'text-tavern-gold/70 hover:text-tavern-gold'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delve</span>
              </button>
            </div>

            {/* World Codex Button */}
            <button
              onClick={() => { soundFx.playClick(); setIsCodexOpen(true); }}
              className="px-2.5 py-1.5 rounded-lg bg-tavern-wood hover:bg-tavern-umber border border-tavern-amber/40 text-tavern-gold font-cinzel font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              title="Open World Codex & Lorebook"
            >
              <BookOpen className="w-3.5 h-3.5 text-tavern-glow" />
              <span className="hidden sm:inline">Codex</span>
            </button>

            {/* Camp Button */}
            <button
              onClick={() => { soundFx.playClick(); setIsCampOpen(true); }}
              className="px-3 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-200 font-cinzel font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-flicker" />
              <span>Camp</span>
            </button>

            {/* Tavern Return Button */}
            <button
              onClick={() => returnToTavern(turnCount >= 3 || worldState.questStage >= 4)}
              className="px-3 py-1.5 rounded-lg bg-tavern-wood hover:bg-tavern-umber border border-tavern-amber/40 text-tavern-gold font-cinzel font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tavern</span>
            </button>

            {/* Save & Return to Character Select Button */}
            <button
              onClick={() => {
                soundFx.playClick();
                saveCurrentSlot(character, companions, 'adventure');
                setCurrentScreen('character_select');
              }}
              className="px-3 py-1.5 rounded-lg bg-tavern-wood hover:bg-tavern-umber border border-tavern-gold/30 hover:border-tavern-gold/60 text-tavern-gold hover:text-tavern-glow font-cinzel font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              title="Save & Exit to Character Select"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Heroes</span>
            </button>
          </div>
        </div>

        {/* 5e Tactical Encounter Bar (When active monsters present or in combat) */}
        {activeMonsters.length > 0 && (
          <EncounterBar
            monsters={activeMonsters}
            turnOrder={turnOrder}
            currentTurnIndex={currentCombatTurn}
            player={character}
            companions={companions}
            activePosition={combatPosition}
            onChangePosition={(pos) => setCombatPosition(pos)}
            onExecuteCombatAction={handleExecuteCombatAction}
            disabled={isLoading}
          />
        )}

        {/* Party Bar with Tactical Assist & Affinity Meters */}
        <PartyBar
          player={character}
          companions={companions}
          onUseTacticalSkill={(comp) => useTacticalSkill(comp)}
          onOpenCamp={() => setIsCampOpen(true)}
        />

        {/* Main 2-Column Adventure Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Left Column: Scene / World Map / Dungeon Map + Narrative Log + Input */}
          <div className="lg:col-span-8 flex flex-col h-full space-y-3 min-w-0">
            {viewMode === 'world_map' ? (
              <WorldMap2D
                campaign={activeCampaign}
                activeNode={activeWorldNode}
                onSelectNode={(node) => travelToWorldNode(node)}
                playerCharacter={character}
              />
            ) : viewMode === 'dungeon_map' ? (
              <DungeonNodeMap
                nodes={activeCampaign?.startingNodes}
                currentNodeId={activeWorldNode?.id}
                onSelectNode={(node) => travelToWorldNode(node)}
                locationName={currentLocation}
              />
            ) : (
              /* 2D Visual Scene Stage with Hotspots & Party Indicators */
              <Scene2DView
                node={currentNode}
                sceneImageUrl={sceneImageUrl}
                fallbackImageUrl={sceneData.imageUrl || sceneData.fallbackUrl}
                party={companions}
                player={character}
                onHotspotClick={handleHotspotClick}
                isLoading={isSceneLoading || isLoading}
              />
            )}

            {/* Narrative Log Stream with Inline DM Editing */}
            <NarrativeLog
              log={adventureLog}
              storySummary={storySummary}
              isLoading={isLoading}
              onEditMessage={(id, content) => editLogEntry(id, content)}
            />

            {/* Decision Matrix: Authored Choices + 3-Mode Freeform Input Bar + Director Undo/Retry */}
            <DecisionMatrix
              choices={currentNode?.choices || []}
              companions={companions}
              player={character}
              dynamicChips={quickActions}
              onSelectChoice={handleSelectDeterministicChoice}
              onFreeformAction={(act, type) => handlePlayerAction(act, type)}
              disabled={isLoading || Boolean(pendingCheck)}
              onUndo={undoLastTurn}
              onRetry={handleRetryTurn}
              canUndo={undoStack.length > 0}
              canRetry={Boolean(lastActionSent)}
            />
          </div>

          {/* Right Column: Character Sheet Panel */}
          <div className="lg:col-span-4 h-full overflow-y-auto">
            <CharacterSheet onInspectItem={(item) => setInspectedItem(item)} />
          </div>
        </div>
      </div>

      {/* 5e D20 Check Modal */}
      {pendingCheck && (
        <DiceRollerModal
          check={pendingCheck}
          character={character}
          tacticalBonus={activeTacticalBonus}
          onRollComplete={handleRollComplete}
          onCancel={() => setPendingCheck(null)}
        />
      )}

      {/* Camp Rest & Social Phase Modal */}
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

      {/* World Codex & Lorebook Modal */}
      {isCodexOpen && (
        <CodexModal
          isOpen={isCodexOpen}
          onClose={() => setIsCodexOpen(false)}
          codexEntries={codexEntries}
        />
      )}

      {/* Parchment Loot & Item Inspection Modal */}
      {inspectedItem && (
        <LootCardModal
          isOpen={Boolean(inspectedItem)}
          onClose={() => setInspectedItem(null)}
          item={inspectedItem}
          onUseItem={(name) => useItem(name)}
        />
      )}
    </div>
  );
}
