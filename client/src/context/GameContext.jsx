import React, { createContext, useContext, useState, useEffect } from 'react';
import { ARCHETYPES } from '../constants/archetypes';
import { SAMPLE_QUESTS } from '../constants/sampleQuests';
import { CAMPAIGN_PRESETS } from '../constants/campaigns';
import { COMPANIONS_POOL, getComplementaryCompanions } from '../constants/companions';
import { soundFx } from '../services/audio';
import { voiceEngine } from '../services/voiceEngine';
import {
  fetchLorebook,
  fetchUserSessions,
  fetchSessionById,
  saveGameSession,
  autosaveGameSession,
  deleteGameSession
} from '../services/api';

const SLOTS_KEY = 'wayward_flagon_slots_v2';
const STORAGE_KEY = 'wayward_flagon_save_v2';
const CUSTOM_QUESTS_KEY = 'wayward_flagon_custom_quests';
const CODEX_KEY = 'wayward_flagon_codex';

function loadInitialSlots() {
  try {
    const raw = localStorage.getItem(SLOTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Auto-migration from legacy single-slot save
    const legacyRaw = localStorage.getItem('wayward_flagon_save_v2') || localStorage.getItem('wayward_flagon_save_v1');
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (legacy && legacy.character) {
        const migratedSlot = {
          slotId: legacy.id || `slot_${Date.now()}`,
          character: legacy.character,
          campaign: legacy.activeCampaign || {
            id: 'legacy-campaign',
            title: 'The Wayward Chronicle',
            theme: 'Adventure',
            difficulty: 'Novice'
          },
          companions: legacy.companions || [],
          activeQuest: legacy.activeQuest || null,
          currentLocation: legacy.currentLocation || 'The Wayward Flagon Tavern',
          currentSceneKey: legacy.currentSceneKey || 'tavern',
          currentScreen: legacy.currentScreen === 'adventure' ? 'adventure' : 'tavern',
          adventureLog: legacy.adventureLog || [],
          storySummary: legacy.storySummary || '',
          worldState: legacy.worldState || {
            questStage: 1,
            flags: {},
            reputation: {},
            discoveredClues: [],
            storyBeat: 'EXPLORATION',
            turnsSinceBanter: 0
          },
          turnCount: legacy.turnCount || 0,
          completedQuests: legacy.completedQuests || [],
          lastPlayed: legacy.lastSaved || new Date().toISOString(),
          totalPlayTime: 0,
          createdAt: legacy.createdAt || new Date().toISOString()
        };
        try {
          localStorage.setItem(SLOTS_KEY, JSON.stringify([migratedSlot]));
        } catch {}
        return [migratedSlot];
      }
    }
  } catch (err) {
    console.warn('Failed to parse save slots:', err);
  }
  return [];
}

const INITIAL_CODEX = [
  {
    id: 'loc_wayward_flagon',
    title: 'The Wayward Flagon',
    category: 'Locations',
    keywords: ['wayward flagon', 'tavern', 'hearth', 'barnaby', 'taproom'],
    description: 'A cozy sanctuary at the crossroads of civilization and the wild frontier. Managed by Barnaby the stout dwarf, its warm hearth and spiced cider have sheltered adventurers for generations.',
    discovered: true
  },
  {
    id: 'npc_barnaby',
    title: 'Barnaby Stonebeard',
    category: 'NPCs',
    keywords: ['barnaby', 'innkeeper', 'stonebeard', 'barkeep'],
    description: 'A retired dwarven vanguard turned jovial tavern keeper. He knows every rumor within fifty leagues and keeps a loaded heavy crossbow under the polished oak bar.',
    discovered: true
  },
  {
    id: 'faction_iron_covenant',
    title: 'The Iron Covenant',
    category: 'Factions',
    keywords: ['iron covenant', 'mercenaries', 'black legion', 'covenant'],
    description: 'A disciplined faction of warbands and monster hunters operating across the borderlands. They uphold contracts with ruthless precision and wear blackened steel pauldrons.',
    discovered: true
  },
  {
    id: 'loc_sunken_crypt',
    title: 'The Sunken Crypt of Oros',
    category: 'Locations',
    keywords: ['crypt', 'oros', 'sunken', 'catacombs', 'sarcophagus', 'tomb'],
    description: 'Ancient subterranean burial chambers flooded with murky brackish water. Built during the First Age to seal the restless spirits of the Netherese court.',
    discovered: false
  },
  {
    id: 'relic_crown_of_ember',
    title: 'Crown of the Ash Sovereign',
    category: 'Relics',
    keywords: ['crown', 'ash sovereign', 'relic', 'ember crown', 'flame circlet'],
    description: 'A wrought-iron coronet perpetually radiating smoldering heat. Legend says it allows its bearer to command primal magma and withstand draconic fire.',
    discovered: false
  },
  {
    id: 'monster_cinder_wyrmling',
    title: 'Cinder Wyrmling',
    category: 'Monsters',
    keywords: ['wyrmling', 'red dragon', 'dragon', 'drake', 'cinder'],
    description: 'A young draconic beast with obsidian scales and molten blood. Highly aggressive and territorial, possessing a devastating breath of superheated sulfur.',
    discovered: false
  }
];

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState('title');
  const [character, setCharacter] = useState(null);
  const [companions, setCompanions] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(CAMPAIGN_PRESETS[0]);
  const [activeWorldNode, setActiveWorldNode] = useState(null);
  const [activeQuest, setActiveQuest] = useState(null);
  const [customQuests, setCustomQuests] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('The Wayward Flagon Tavern');
  const [currentSceneKey, setCurrentSceneKey] = useState('tavern');
  const [adventureLog, setAdventureLog] = useState([]);
  const [storySummary, setStorySummary] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [worldState, setWorldState] = useState({ questStage: 1, totalStages: 4, flags: {} });
  const [completedQuests, setCompletedQuests] = useState([]);
  const [pendingCheck, setPendingCheck] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [serverStatus, setServerStatus] = useState({ mode: 'checking' });
  const [quickActions, setQuickActions] = useState([]);
  const [activeTacticalBonus, setActiveTacticalBonus] = useState(null);

  // World Codex Lorebook
  const [codexEntries, setCodexEntries] = useState(INITIAL_CODEX);

  // Undo / Retry History Stack (Max 10 snapshots)
  const [undoStack, setUndoStack] = useState([]);

  // Tactical 5e Combat State
  const [activeMonsters, setActiveMonsters] = useState([]);
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentCombatTurn, setCurrentCombatTurn] = useState(0);
  const [combatPosition, setCombatPosition] = useState('Engaged (Melee)');

  // Load saved custom quests & codex
  useEffect(() => {
    try {
      const savedQuests = localStorage.getItem(CUSTOM_QUESTS_KEY);
      if (savedQuests) {
        setCustomQuests(JSON.parse(savedQuests));
      }
      const savedCodex = localStorage.getItem(CODEX_KEY);
      if (savedCodex) {
        setCodexEntries(JSON.parse(savedCodex));
      }
    } catch (e) {}
  }, []);

  const pushHistorySnapshot = () => {
    if (!character) return;
    const snapshot = {
      character: JSON.parse(JSON.stringify(character)),
      companions: JSON.parse(JSON.stringify(companions)),
      adventureLog: [...adventureLog],
      storySummary,
      turnCount,
      worldState: { ...worldState },
      currentLocation,
      currentSceneKey,
      activeWorldNode: activeWorldNode ? { ...activeWorldNode } : null,
      activeCampaign: activeCampaign ? { ...activeCampaign } : null,
      activeMonsters: [...activeMonsters]
    };
    setUndoStack(prev => [snapshot, ...prev].slice(0, 10));
  };

  const undoLastTurn = () => {
    if (undoStack.length === 0) return false;
    soundFx.playClick();
    const [previous, ...rest] = undoStack;

    if (previous) {
      setCharacter(previous.character);
      setCompanions(previous.companions);
      setAdventureLog(previous.adventureLog);
      setStorySummary(previous.storySummary);
      setTurnCount(previous.turnCount);
      setWorldState(previous.worldState);
      setCurrentLocation(previous.currentLocation);
      setCurrentSceneKey(previous.currentSceneKey);
      if (previous.activeWorldNode) setActiveWorldNode(previous.activeWorldNode);
      if (previous.activeCampaign) setActiveCampaign(previous.activeCampaign);
      if (previous.activeMonsters) setActiveMonsters(previous.activeMonsters);
      setUndoStack(rest);

      setAdventureLog(prev => [
        ...prev,
        {
          id: `undo-${Date.now()}`,
          role: 'system',
          content: '⏪ **Director\'s Undo**: Previous turn rolled back. Prior HP, items, and narrative state restored.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return true;
    }
    return false;
  };

  const editLogEntry = (id, newContent) => {
    setAdventureLog(prev => prev.map(entry => {
      if (entry.id === id) {
        return { ...entry, content: newContent, isEdited: true };
      }
      return entry;
    }));
  };

  const unlockCodexEntry = (entry) => {
    setCodexEntries(prev => {
      const exists = prev.find(e => e.id === entry.id || e.title.toLowerCase() === entry.title.toLowerCase());
      let updated;
      if (exists) {
        updated = prev.map(e => (e.id === exists.id ? { ...e, ...entry, discovered: true } : e));
      } else {
        updated = [{ ...entry, discovered: true }, ...prev];
      }
      try {
        localStorage.setItem(CODEX_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const [saveSlots, setSaveSlots] = useState(() => loadInitialSlots());
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [pendingCharacter, setPendingCharacter] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const refreshSessions = async () => {
    try {
      const list = await fetchUserSessions();
      if (Array.isArray(list) && list.length > 0) {
        // Merge cloud sessions with local slots
        setSaveSlots(prev => {
          const mergedMap = new Map();
          list.forEach(item => {
            if (item.id && item.character) {
              mergedMap.set(item.id, { slotId: item.id, ...item });
            }
          });
          prev.forEach(item => {
            if (item.slotId) mergedMap.set(item.slotId, item);
          });
          const result = Array.from(mergedMap.values()).slice(0, 5);
          localStorage.setItem(SLOTS_KEY, JSON.stringify(result));
          return result;
        });
      }
    } catch (e) {
      console.warn('Failed to refresh saved sessions:', e);
    }
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  const saveCurrentSlot = async (overrideChar = null, overrideCompanions = null, overrideScreen = null) => {
    try {
      const charToSave = overrideChar || character;
      if (!charToSave) return false;

      const targetSlotId = activeSlotId || `slot_${Date.now()}`;
      if (!activeSlotId) setActiveSlotId(targetSlotId);

      const updatedSlot = {
        slotId: targetSlotId,
        character: charToSave,
        campaign: activeCampaign || { id: 'default', title: 'Chronicle of the Flagon', theme: 'Dungeon Crawl', difficulty: 'Adept' },
        companions: overrideCompanions || companions,
        activeQuest,
        activeWorldNode,
        currentLocation,
        currentSceneKey,
        currentScreen: overrideScreen || currentScreen,
        adventureLog,
        storySummary,
        worldState,
        turnCount,
        completedQuests,
        codexEntries,
        activeMonsters,
        turnOrder,
        currentCombatTurn,
        combatPosition,
        lastPlayed: new Date().toISOString()
      };

      setIsSaving(true);
      setSaveSlots(prev => {
        const index = prev.findIndex(s => s.slotId === targetSlotId);
        let next;
        if (index >= 0) {
          next = [...prev];
          next[index] = { ...prev[index], ...updatedSlot, createdAt: prev[index].createdAt || updatedSlot.lastPlayed };
        } else {
          next = [{ ...updatedSlot, createdAt: new Date().toISOString() }, ...prev].slice(0, 5);
        }
        try {
          localStorage.setItem(SLOTS_KEY, JSON.stringify(next));
        } catch (err) {
          console.warn('LocalStorage save quota exceeded:', err);
        }
        return next;
      });

      // Background cloud sync
      saveGameSession(targetSlotId, updatedSlot).catch(() => {});
      setIsSaving(false);
      return true;
    } catch (e) {
      console.error('Failed to save slot:', e);
      setIsSaving(false);
      return false;
    }
  };

  const loadSlot = async (slotId) => {
    try {
      soundFx.playClick();
      soundFx.startTavernAmbience();

      let slot = saveSlots.find(s => s.slotId === slotId);
      if (!slot) {
        try {
          slot = await fetchSessionById(slotId);
        } catch {}
      }

      if (!slot || !slot.character) return false;

      setActiveSlotId(slot.slotId);
      setCharacter(slot.character);
      setCompanions(slot.companions || getComplementaryCompanions(slot.character.class));
      if (slot.campaign) setActiveCampaign(slot.campaign);
      if (slot.activeWorldNode) setActiveWorldNode(slot.activeWorldNode);
      setActiveQuest(slot.activeQuest || null);
      setCurrentLocation(slot.currentLocation || 'The Wayward Flagon Tavern');
      setCurrentSceneKey(slot.currentSceneKey || 'tavern');
      setAdventureLog(slot.adventureLog || []);
      setStorySummary(slot.storySummary || '');
      setTurnCount(slot.turnCount || 0);
      setWorldState(slot.worldState || { questStage: 1, totalStages: 4, flags: {} });
      setCompletedQuests(slot.completedQuests || []);
      if (slot.codexEntries) setCodexEntries(slot.codexEntries);
      if (slot.activeMonsters) setActiveMonsters(slot.activeMonsters);
      if (slot.turnOrder) setTurnOrder(slot.turnOrder);
      if (typeof slot.currentCombatTurn === 'number') setCurrentCombatTurn(slot.currentCombatTurn);
      if (slot.combatPosition) setCombatPosition(slot.combatPosition);

      // Touch lastPlayed
      setSaveSlots(prev => {
        const updated = prev.map(s => s.slotId === slotId ? { ...s, lastPlayed: new Date().toISOString() } : s);
        try {
          localStorage.setItem(SLOTS_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      const targetScreen = slot.currentScreen === 'adventure' ? 'adventure' : 'tavern';
      setCurrentScreen(targetScreen);
      soundFx.setMood(targetScreen === 'adventure' ? (slot.campaign?.initialMood || 'exploration_wonder') : 'tavern_calm');
      return true;
    } catch (e) {
      console.error('Failed to load slot:', e);
      return false;
    }
  };

  const createNewSlot = (newChar, newCampaign) => {
    soundFx.playClick();
    soundFx.startTavernAmbience();
    soundFx.playSuccess(false);

    const initialCompanions = getComplementaryCompanions(newChar.class);
    const slotId = `slot_${Date.now()}`;

    const introLog = [
      {
        id: `msg-${Date.now()}`,
        role: 'dm',
        content: `Welcome to **The Wayward Flagon**, ${newChar.name}. The hearth crackles with welcoming embers, and Barnaby pours a fresh mug of spiced cider. Your chronicle in **${newCampaign.title}** begins here.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    const newSlot = {
      slotId,
      character: newChar,
      campaign: newCampaign,
      companions: initialCompanions,
      activeQuest: null,
      currentLocation: 'The Wayward Flagon Tavern',
      currentSceneKey: 'tavern',
      currentScreen: 'tavern',
      adventureLog: introLog,
      storySummary: '',
      worldState: {
        questStage: 0,
        flags: {},
        reputation: {},
        discoveredClues: [],
        storyBeat: 'EXPLORATION',
        turnsSinceBanter: 0
      },
      turnCount: 0,
      completedQuests: [],
      lastPlayed: new Date().toISOString(),
      totalPlayTime: 0,
      createdAt: new Date().toISOString()
    };

    setActiveSlotId(slotId);
    setCharacter(newChar);
    setCompanions(initialCompanions);
    setActiveCampaign(newCampaign);
    setActiveQuest(null);
    setCurrentLocation('The Wayward Flagon Tavern');
    setCurrentSceneKey('tavern');
    setAdventureLog(introLog);
    setStorySummary('');
    setTurnCount(0);
    setWorldState({ questStage: 0, flags: {}, reputation: {}, discoveredClues: [], storyBeat: 'EXPLORATION', turnsSinceBanter: 0 });
    setCompletedQuests([]);
    setPendingCharacter(null);

    setSaveSlots(prev => {
      const next = [newSlot, ...prev.filter(s => s.slotId !== slotId)].slice(0, 5);
      try {
        localStorage.setItem(SLOTS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    saveGameSession(slotId, newSlot).catch(() => {});
    setCurrentScreen('tavern');
    soundFx.setMood('tavern_calm');
    return newSlot;
  };

  const deleteSlot = (slotId) => {
    soundFx.playClick();
    setSaveSlots(prev => {
      const next = prev.filter(s => s.slotId !== slotId);
      try {
        localStorage.setItem(SLOTS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (activeSlotId === slotId) {
      setActiveSlotId(null);
      setCharacter(null);
      setCompanions([]);
      setAdventureLog([]);
      setActiveQuest(null);
      setCurrentScreen('character_select');
    }

    deleteGameSession(slotId).catch(() => {});
  };

  const getAllSlots = () => {
    return [...saveSlots].sort((a, b) => new Date(b.lastPlayed || 0) - new Date(a.lastPlayed || 0));
  };

  const getSlotCount = () => saveSlots.length;

  // Compatibility adapters
  const saveGame = (c, comps, screen) => saveCurrentSlot(c, comps, screen);
  const loadGame = (id) => loadSlot(id);
  const hasSaveGame = () => saveSlots.length > 0;
  const startNewGame = () => {
    setActiveSlotId(null);
    setCharacter(null);
    setCompanions([]);
    setPendingCharacter(null);
    setCurrentScreen('create');
  };


  const addCustomCampaign = (campaign) => {
    setCustomQuests(prev => {
      const updated = [campaign, ...prev];
      localStorage.setItem(CUSTOM_QUESTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const returnToTavern = (completed = false) => {
    if (completed && activeQuest) {
      if (!completedQuests.includes(activeQuest.id)) {
        setCompletedQuests(prev => [...prev, activeQuest.id]);
      }
      if (character) {
        const updated = {
          ...character,
          gold: character.gold + (activeQuest.rewardGold || 50),
          inventory: activeQuest.rewardItem ? [...character.inventory, activeQuest.rewardItem] : character.inventory,
          hp: Math.min(character.maxHp, character.hp + 6)
        };
        const healedComps = companions.map(c => ({ ...c, hp: c.maxHp, isFallen: false }));
        setCharacter(updated);
        setCompanions(healedComps);
        saveGame(updated, healedComps, 'tavern');
      }
    }
    setActiveQuest(null);
    setActiveMonsters([]);
    setCurrentLocation('The Wayward Flagon Tavern');
    setCurrentSceneKey('tavern');
    setPendingCheck(null);
    setCurrentScreen('tavern');
    soundFx.playClick();
    soundFx.setMood('tavern_calm');
  };

  const launchWorldCampaign = (campaign) => {
    setActiveCampaign(campaign);
    const nodes = (campaign.startingNodes || []).map((n, i) => ({
      ...n,
      unlocked: i === 0 || n.unlocked
    }));
    const startNode = nodes[0] || {
      id: 'node_entry',
      name: campaign.title,
      description: campaign.description,
      type: 'outpost',
      x: 20,
      y: 50,
      connectedTo: [],
      unlocked: true
    };

    setActiveWorldNode(startNode);
    setCurrentLocation(startNode.name);
    setCurrentSceneKey(campaign.environment || 'crypt');
    setTurnCount(0);
    setUndoStack([]);
    setWorldState({ questStage: 1, totalStages: nodes.length || 4, flags: {} });

    const introBeat = {
      id: `msg-${Date.now()}`,
      role: 'dm',
      content: `### 🗺️ ${campaign.title}\n*${campaign.subtitle}*\n\n${campaign.description}\n\nYour party arrives at **${startNode.name}** (${startNode.description}). What is your first action?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAdventureLog([introBeat]);
    setQuickActions([
      `Explore the grounds of ${startNode.name}`,
      'Scout ahead in tactical party formation',
      'Search for hidden caches, runes or clues',
      'Check in with your companions before advancing'
    ]);

    if (companions.length === 0 && character) {
      setCompanions(getComplementaryCompanions(character.class));
    }

    setCurrentScreen('adventure');
    soundFx.playClick();
    soundFx.setMood(campaign.initialMood || 'exploration_wonder');
    soundFx.setIntensity(campaign.initialIntensity || 2);
  };

  const travelToWorldNode = (node) => {
    if (!node || !activeCampaign) return;
    pushHistorySnapshot();
    soundFx.playClick();
    soundFx.triggerSting('secret_found');

    setActiveWorldNode(node);
    setCurrentLocation(node.name);

    if (activeCampaign.startingNodes) {
      const updatedNodes = activeCampaign.startingNodes.map(n => {
        if (n.id === node.id) return { ...n, unlocked: true, visited: true };
        if (node.connectedTo && node.connectedTo.includes(n.id)) return { ...n, unlocked: true };
        return n;
      });
      setActiveCampaign({ ...activeCampaign, startingNodes: updatedNodes });
    }

    const travelBeat = {
      id: `travel-${Date.now()}`,
      role: 'dm',
      content: `👣 **Traveled to ${node.name}**\n${node.description}\n\nYour party stands ready at this waypoint. How do you proceed?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAdventureLog(prev => [...prev, travelBeat]);
    setQuickActions([
      `Scout the area around ${node.name}`,
      node.type === 'boss' ? 'Prepare for boss confrontation!' : 'Search for hidden loot and secrets',
      'Set up a short rest or camp',
      'Inspect local landmarks and altars'
    ]);
  };

  const launchQuest = (quest) => {
    setActiveQuest(quest);
    setCurrentLocation(quest.location);
    setCurrentSceneKey(quest.sceneType || 'crypt');
    setTurnCount(0);
    setUndoStack([]);
    setWorldState({ questStage: 1, totalStages: 4, flags: {} });

    const initialBeat = {
      id: `msg-${Date.now()}`,
      role: 'dm',
      content: quest.initialNarration || `You and your companions step out toward ${quest.location}. The path is treacherous, but glory and coin await! What do you do?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAdventureLog([initialBeat]);
    setQuickActions([
      'Investigate the immediate surroundings',
      'Ready weapons and move forward in tactical formation',
      'Look for tracks or signs of ambush',
      'Cast a detection or illumination spell'
    ]);

    if (companions.length === 0 && character) {
      setCompanions(getComplementaryCompanions(character.class));
    }

    setCurrentScreen('adventure');
    soundFx.playClick();
    soundFx.setMood('exploration_wonder');
  };

  const recruitCompanion = (companionId) => {
    const template = COMPANIONS_POOL.find(c => c.id === companionId);
    if (!template) return;
    if (companions.some(c => c.id === companionId)) return;

    const newCompanion = {
      ...template,
      recruited: true,
      hp: template.maxHp,
      approval: 55,
      isFallen: false
    };

    const updated = [...companions, newCompanion];
    setCompanions(updated);
    soundFx.playSuccess(true);
    soundFx.triggerSting('victory_fanfare');

    setAdventureLog(prev => [
      ...prev,
      {
        id: `recruit-${Date.now()}`,
        role: 'system',
        content: `⚔️ **${template.name}** (${template.class}) has joined your party! [Affinity: Loyal (55/100)]`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    saveGame(null, updated);
  };

  const adjustCompanionApproval = (companionId, delta) => {
    setCompanions(prev => prev.map(c => {
      if (c.id === companionId || c.name.toLowerCase().includes(companionId.toLowerCase())) {
        const newScore = Math.max(0, Math.min(100, (c.approval || 50) + delta));
        return { ...c, approval: newScore };
      }
      return c;
    }));
  };

  const performCampRest = (restType = 'long') => {
    soundFx.playClick();
    if (!character) return;
    pushHistorySnapshot();

    const healAmount = restType === 'long' ? character.maxHp : Math.round(character.maxHp * 0.5);
    const newCharHp = Math.min(character.maxHp, character.hp + healAmount);

    // Reset spell slots on long rest
    const updatedSpellSlots = {
      level1: { total: 3, current: 3 },
      level2: { total: 2, current: 2 }
    };

    const updatedChar = {
      ...character,
      hp: newCharHp,
      spellSlots: restType === 'long' ? updatedSpellSlots : character.spellSlots
    };
    setCharacter(updatedChar);

    const updatedCompanions = companions.map(c => ({
      ...c,
      hp: restType === 'long' ? c.maxHp : Math.min(c.maxHp, c.hp + Math.round(c.maxHp * 0.5)),
      isFallen: false
    }));
    setCompanions(updatedCompanions);

    setAdventureLog(prev => [
      ...prev,
      {
        id: `rest-${Date.now()}`,
        role: 'system',
        content: `🏕️ The party took a **${restType === 'long' ? 'Long Rest (8 Hours)' : 'Short Rest (1 Hour)'}** by the campfire. ${restType === 'long' ? 'All HP, Hit Dice, and Spell Slots fully restored.' : 'Wounds dressed; recovered 50% HP.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    saveGame(updatedChar, updatedCompanions);
  };

  const useTacticalSkill = (companion) => {
    if (!companion || !companion.tacticalSkill) return;
    soundFx.playClick();
    soundFx.triggerSting('spell_cast');

    setActiveTacticalBonus({
      companionName: companion.name,
      skillName: companion.tacticalSkill.name,
      bonus: companion.tacticalSkill.bonus,
      icon: companion.tacticalSkill.icon
    });

    setAdventureLog(prev => [
      ...prev,
      {
        id: `skill-${Date.now()}`,
        role: 'system',
        content: `🌟 **${companion.name}** prepares **${companion.tacticalSkill.name}**! (+${companion.tacticalSkill.bonus} bonus on your next check)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const useItem = (itemName) => {
    if (!character) return;
    soundFx.playClick();

    if (itemName.toLowerCase().includes('healing potion') || itemName.toLowerCase().includes('salve') || itemName.toLowerCase().includes('draught')) {
      const healAmount = 10;
      const newHp = Math.min(character.maxHp, character.hp + healAmount);
      const newInventory = [...character.inventory];
      const idx = newInventory.indexOf(itemName);
      if (idx > -1) newInventory.splice(idx, 1);

      const updated = { ...character, hp: newHp, inventory: newInventory };
      setCharacter(updated);

      setAdventureLog(prev => [
        ...prev,
        {
          id: `item-${Date.now()}`,
          role: 'system',
          content: `🧪 You consumed ${itemName} and restored ${healAmount} HP! (HP: ${newHp}/${character.maxHp})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      soundFx.playSuccess(false);
      saveGame(updated);
      return;
    }

    setAdventureLog(prev => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        role: 'system',
        content: `⚔️ Action Performed: ${itemName}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const toggleAudio = () => {
    const isMuted = soundFx.toggleMute();
    setIsAudioMuted(isMuted);
  };

  const toggleVoiceNarration = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    voiceEngine.setEnabled(next);
  };

  return (
    <GameContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        character,
        setCharacter,
        companions,
        setCompanions,
        activeCampaign,
        setActiveCampaign,
        activeWorldNode,
        setActiveWorldNode,
        activeQuest,
        setActiveQuest,
        customQuests,
        addCustomCampaign,
        currentLocation,
        setCurrentLocation,
        currentSceneKey,
        setCurrentSceneKey,
        adventureLog,
        setAdventureLog,
        storySummary,
        setStorySummary,
        turnCount,
        setTurnCount,
        worldState,
        setWorldState,
        completedQuests,
        setCompletedQuests,
        pendingCheck,
        setPendingCheck,
        quickActions,
        setQuickActions,
        activeTacticalBonus,
        setActiveTacticalBonus,
        isAudioMuted,
        toggleAudio,
        isVoiceEnabled,
        toggleVoiceNarration,
        serverStatus,
        setServerStatus,
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
        saveSlots,
        activeSlotId,
        pendingCharacter,
        setPendingCharacter,
        loadSlot,
        saveCurrentSlot,
        createNewSlot,
        deleteSlot,
        getAllSlots,
        getSlotCount,
        saveGame,
        loadGame,
        hasSaveGame,
        startNewGame,
        isSaving,
        refreshSessions,
        triggerAutosave,
        deleteSession: deleteGameSession,
        returnToTavern,
        launchCampaign: launchWorldCampaign,
        launchWorldCampaign,
        travelToWorldNode,
        launchQuest,
        recruitCompanion,
        adjustCompanionApproval,
        performCampRest,
        useTacticalSkill,
        useItem
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
