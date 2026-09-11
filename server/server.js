import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { narrateTurn, summarizeWithGemini } from './services/geminiAdapter.js';
import { generatePortrait } from './services/imageAdapter.js';
import { generateSceneImage } from './services/sceneImageAdapter.js';
import { generateCampaign } from './services/campaignGenerator.js';
import { getMonster, getSpell, getItem, searchSRD } from './services/dndDataService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    mode: hasKey ? 'live-gemini' : 'smart-simulation-mode',
    message: hasKey
      ? 'Connected to Gemini API'
      : 'Operating in Smart Simulation Mode (Full gameplay active without API key)',
    timestamp: new Date().toISOString()
  });
});

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

// Character Portrait Generation Endpoint
app.post('/api/dm/generate-portrait', async (req, res) => {
  try {
    const { characterClass, description } = req.body;
    const result = await generatePortrait({ characterClass, description });
    res.json(result);
  } catch (error) {
    console.error('Error handling /api/dm/generate-portrait:', error);
    res.status(500).json({ error: 'Failed to generate portrait', details: error.message });
  }
});

// Dynamic 16:9 Scene Illustration Generation Endpoint
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

import { getLorebook, resetLorebook } from './services/lorebookService.js';

// Lorebook / World Codex Endpoints
app.get('/api/lorebook', (req, res) => {
  res.json({ entries: getLorebook() });
});

app.post('/api/lorebook/reset', (req, res) => {
  res.json({ entries: resetLorebook() });
});

// TTS Endpoint Proxy (Web Speech API is client-side default; this endpoint serves as proxy/status)
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
  console.log(`🗡️ Engine status: ${hasKey ? 'Live Gemini 2.5 Flash Engine' : 'Offline Smart Simulation Engine'}`);
});

