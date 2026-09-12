import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { narrateTurn, summarizeWithGemini } from './services/geminiAdapter.js';
import { generatePortrait } from './services/imageAdapter.js';
import { generateSceneImage } from './services/sceneImageAdapter.js';
import { generateCampaign } from './services/campaignGenerator.js';
import { getMonster, getSpell, getItem, searchSRD } from './services/dndDataService.js';
import { getLorebook, resetLorebook } from './services/lorebookService.js';
import { requireAuth } from './middleware/auth.js';
import { isFirebaseLive } from './services/firebaseAdmin.js';
import {
  listSessions,
  loadSession,
  saveSession,
  autosaveSession,
  deleteSession
} from './services/sessionManager.js';
import {
  executeDiceRoll,
  resolveCheck,
  resolveAttack,
} from './services/rulesEngine.js';
import {
  advanceWorldTime,
  interactWithWorldObject,
  modifyFactionReputation,
  createInitialWorldState
} from './services/worldEngine.js';
import {
  getNpc,
  getAllNpcs,
  getNpcsAtLocation,
} from './services/npcSimulation.js';
import {
  adjustCompanionLoyalty,
} from './services/companionEngine.js';
import {
  startQuest,
  advanceQuestObjective,
  failQuest
} from './services/questEngine.js';
import { fileURLToPath } from 'url';
import {
  buildDirectorGuidance,
  evaluateActTransition
} from './services/storyDirector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static delivery for permanently cached image assets
const ASSETS_DIR = path.resolve(process.cwd(), '.data', 'assets');
app.use('/api/assets', express.static(ASSETS_DIR));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    mode: hasKey ? 'live-gemini' : 'smart-simulation-mode',
    firebase: isFirebaseLive() ? 'live-cloud' : 'local-persistence-mock',
    message: hasKey
      ? 'Connected to Gemini API'
      : 'Operating in Smart Simulation Mode (Full gameplay active without API key)',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// SESSION & PERSISTENCE ENDPOINTS (PHASE 1)
// ==========================================

// List all sessions for the authenticated / guest user
app.get('/api/sessions', requireAuth, async (req, res) => {
  try {
    const sessions = await listSessions(req.user.uid);
    res.json({ sessions });
  } catch (error) {
    console.error('[Session API] Error listing sessions:', error);
    res.status(500).json({ error: 'Failed to list sessions', details: error.message });
  }
});

// Load a specific session
app.get('/api/session/:id', requireAuth, async (req, res) => {
  try {
    const session = await loadSession(req.user.uid, req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ session });
  } catch (error) {
    console.error('[Session API] Error loading session:', error);
    res.status(500).json({ error: 'Failed to load session', details: error.message });
  }
});

// Manual save session
app.post('/api/session/save', requireAuth, async (req, res) => {
  try {
    const { sessionId, sessionData } = req.body;
    const saved = sessionId
      ? await saveSession(req.user.uid, sessionId, sessionData)
      : await autosaveSession(req.user.uid, null, sessionData);
    res.json({ success: true, session: saved });
  } catch (error) {
    console.error('[Session API] Error saving session:', error);
    res.status(500).json({ error: 'Failed to save session', details: error.message });
  }
});

// Autosave checkpoint
app.post('/api/session/autosave', requireAuth, async (req, res) => {
  try {
    const { sessionId, sessionData } = req.body;
    const saved = await autosaveSession(req.user.uid, sessionId, sessionData);
    res.json({ success: true, session: saved });
  } catch (error) {
    console.error('[Session API] Error autosaving session:', error);
    res.status(500).json({ error: 'Failed to autosave session', details: error.message });
  }
});

// Delete a session
app.delete('/api/session/:id', requireAuth, async (req, res) => {
  try {
    const result = await deleteSession(req.user.uid, req.params.id);
    res.json(result);
  } catch (error) {
    console.error('[Session API] Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session', details: error.message });
  }
});

// ==========================================
// DETERMINISTIC RULES ENGINE (PHASE 3)
// ==========================================

// Server-authoritative cryptographic dice roll
app.post('/api/rules/roll', (req, res) => {
  try {
    const { notation = '1d20', options = {} } = req.body;
    const result = executeDiceRoll(notation, options);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Server-authoritative ability / skill check
app.post('/api/rules/check', (req, res) => {
  try {
    const { character, ability, skill, dc, advantage, disadvantage, situationalBonus } = req.body;
    const result = resolveCheck({ character, ability, skill, dc, advantage, disadvantage, situationalBonus });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Combat Attack Resolution (Attack vs AC + Damage Calculation)
app.post('/api/rules/combat/attack', (req, res) => {
  try {
    const { attacker, defender, attackBonus, damageNotation, damageType, advantage, disadvantage } = req.body;
    const result = resolveAttack({ attacker, defender, attackBonus, damageNotation, damageType, advantage, disadvantage });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Short / Long Rest Resolution
app.post('/api/rules/rest', (req, res) => {
  try {
    const { type = 'short', character, hitDiceToSpend = 1 } = req.body;
    const result = type === 'long'
      ? resolveLongRest({ character })
      : resolveShortRest({ character, hitDiceToSpend });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// PERSISTENT WORLD & NPC SIMULATION (PHASE 4)
// ==========================================

// Advance World Time & Weather Simulation
app.post('/api/world/advance-time', (req, res) => {
  try {
    const { worldState, stepCount = 1 } = req.body;
    const currentState = worldState || createInitialWorldState();
    const updated = advanceWorldTime(currentState, stepCount);
    const nearbyNpcs = getNpcsAtLocation(updated.currentLocation || 'tavern', updated.time);
    res.json({ worldState: updated, nearbyNpcs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Interactive World Entity Action (chests, doors, levers)
app.post('/api/world/interact', (req, res) => {
  try {
    const { worldState, objectId, action, diceResult } = req.body;
    const currentState = worldState || createInitialWorldState();
    const result = interactWithWorldObject({ worldState: currentState, objectId, action, diceResult });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Query NPCs at location based on current time-of-day schedule
app.get('/api/world/npcs', (req, res) => {
  try {
    const { location = 'tavern', time = 'afternoon' } = req.query;
    const npcs = getNpcsAtLocation(location, time);
    res.json({ npcs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get individual NPC knowledge & memories
app.get('/api/world/npc/:id', (req, res) => {
  try {
    const npc = getNpc(req.params.id);
    if (!npc) return res.status(404).json({ error: 'NPC not found' });
    res.json({ npc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record structured episodic memory for an NPC
app.post('/api/world/npc/:id/memory', (req, res) => {
  try {
    const { event, importance, location, participants, consequences } = req.body;
    const memory = recordNpcMemory(req.params.id, { event, importance, location, participants, consequences });
    res.json({ success: true, memory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// COMPANION SYSTEM & SOCIAL PHASES (PHASE 5)
// ==========================================

// Evaluate moral decision on companion loyalty & breaking points
app.post('/api/companion/evaluate-choice', (req, res) => {
  try {
    const { companion, triggerKey, reason } = req.body;
    if (!companion) return res.status(400).json({ error: 'Companion object is required' });
    const result = adjustCompanionLoyalty(companion, triggerKey, reason);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decide companion tactical combat action
app.post('/api/companion/combat-action', (req, res) => {
  try {
    const { companion, party, enemies } = req.body;
    if (!companion) return res.status(400).json({ error: 'Companion object is required' });
    const action = decideCompanionCombatAction(companion, { party, enemies });
    res.json({ action });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// QUEST ENGINE & STORY DIRECTOR (PHASE 6)
// ==========================================

// Start a new persistent quest
app.post('/api/quest/start', (req, res) => {
  try {
    const { questState = { active: [], completed: [], failed: [] }, template } = req.body;
    if (!template) return res.status(400).json({ error: 'Quest template is required' });
    const updated = startQuest(questState, template);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Advance quest objective & trigger consequences
app.post('/api/quest/advance-objective', (req, res) => {
  try {
    const { questState, questId, objectiveId, worldState } = req.body;
    const result = advanceQuestObjective(questState, questId, objectiveId, worldState);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fail a quest
app.post('/api/quest/fail', (req, res) => {
  try {
    const { questState, questId, reason } = req.body;
    const result = failQuest(questState, questId, reason);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Story Director Guidance Generator
app.post('/api/director/guidance', (req, res) => {
  try {
    const { campaign, currentAct, turnCount, worldState } = req.body;
    const guidance = buildDirectorGuidance({ campaign, currentAct, turnCount, worldState });
    res.json({ guidance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Story Director Act Transition Evaluator
app.post('/api/director/act-transition', (req, res) => {
  try {
    const { campaign, currentAct, completedQuestIds } = req.body;
    const result = evaluateActTransition(campaign, currentAct, completedQuestIds);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// DM NARRATION & ART GENERATION (PHASE 2)
// ==========================================

// DM Narration Endpoint
app.post('/api/dm/narrate', async (req, res) => {
  try {
    const {
      character,
      companions,
      action,
      actionType,
      quest,
      location,
      checkResult,
      history,
      storySummary,
      worldState
    } = req.body;

    const result = await narrateTurn({
      character,
      companions,
      action,
      actionType,
      quest,
      location,
      checkResult,
      history,
      storySummary,
      worldState
    });

    res.json(result);
  } catch (error) {
    console.error('Error handling /api/dm/narrate:', error);
    res.status(500).json({
      error: 'Failed to generate DM narration',
      details: error.message
    });
  }
});

// Character Portrait Generation Endpoint (Permanent Content-Addressed)
app.post('/api/dm/generate-portrait', async (req, res) => {
  try {
    const { race, characterClass, description, forceNew, variation } = req.body;
    const result = await generatePortrait({ race, characterClass, description, forceNew, variation });
    res.json(result);
  } catch (error) {
    console.error('Error handling /api/dm/generate-portrait:', error);
    res.status(500).json({ error: 'Failed to generate portrait', details: error.message });
  }
});

// Dynamic 16:9 Scene Illustration Generation Endpoint (Permanent Content-Addressed)
app.post('/api/dm/generate-scene', async (req, res) => {
  try {
    const { sceneDescription, location, mood } = req.body;
    const result = await generateSceneImage({ sceneDescription, location, mood });
    res.json(result);
  } catch (error) {
    console.error('Error handling /api/dm/generate-scene:', error);
    res.status(500).json({ error: 'Failed to generate scene art', details: error.message });
  }
});

// Dynamic Campaign Generator Endpoint
app.post('/api/dm/generate-campaign', async (req, res) => {
  try {
    const { theme, difficulty, partyLevel, partyComposition } = req.body;
    const campaign = await generateCampaign({ theme, difficulty, partyLevel, partyComposition });
    res.json(campaign);
  } catch (error) {
    console.error('Error handling /api/dm/generate-campaign:', error);
    res.status(500).json({ error: 'Failed to generate campaign', details: error.message });
  }
});

// D&D 5e SRD Reference Data Endpoints
app.get('/api/dnd/monster/:name', async (req, res) => {
  try {
    const data = await getMonster(req.params.name);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/dnd/spell/:name', async (req, res) => {
  try {
    const data = await getSpell(req.params.name);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/dnd/item/:name', async (req, res) => {
  try {
    const data = await getItem(req.params.name);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/dnd/search', async (req, res) => {
  try {
    const results = await searchSRD(req.query.q);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Lorebook / World Codex Endpoints
app.get('/api/lorebook', (req, res) => {
  res.json({ entries: getLorebook() });
});

app.post('/api/lorebook/reset', (req, res) => {
  res.json({ entries: resetLorebook() });
});

// TTS Endpoint Proxy
app.post('/api/tts', (req, res) => {
  const { text } = req.body;
  res.json({
    status: 'ok',
    mode: 'browser-webspeech-native',
    length: text ? text.length : 0
  });
});

// Story Chronicle Intelligent Summarizer Endpoint
app.post('/api/dm/summarize', async (req, res) => {
  try {
    const { currentSummary, recentEvents } = req.body;
    const summary = await summarizeWithGemini(currentSummary, recentEvents);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🏰 The Wayward Flagon Server listening on http://localhost:${PORT}`);
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY');
  const activeModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  console.log(`🗡️ Engine status: ${hasKey ? `Live Gemini AI Engine (${activeModel})` : 'Offline Smart Simulation Engine'}`);
  console.log(`🔥 Persistence: ${isFirebaseLive() ? 'Cloud Firestore' : 'Local JSON (.data/firestore/)'}`);
  console.log(`🖼️ Asset Store: Permanent content-addressed storage (.data/assets/)`);
});
