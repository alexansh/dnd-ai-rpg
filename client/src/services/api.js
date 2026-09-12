/**
 * Client API Service to communicate strictly with the Express backend proxy
 */
import { getAuthHeaders } from './firebase.js';

export async function checkServerHealth() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/health', { headers });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', mode: 'smart-simulation-mode', message: err.message };
  }
}

export async function narrateAction({
  character,
  companions = [],
  action,
  actionType,
  quest,
  location,
  checkResult,
  history,
  storySummary,
  worldState
}) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/dm/narrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({
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
      })
    });

    if (!res.ok) {
      throw new Error(`API Error (${res.status})`);
    }

    return await res.json();
  } catch (error) {
    console.error('Failed to call DM narration API:', error);
    return {
      narration: `The torchlight wavers in the silence of the chamber. Your resolve holds steady as you prepare your next maneuver.`,
      sceneHint: `${location || 'Dungeon corridor'} with flickering torchlight.`,
      quickActions: ['Scout the area carefully', 'Ready your weapon', 'Examine the room', 'Take a defensive stance'],
      check: null,
      hpChange: 0,
      goldChange: 0,
      loot: [],
      companionActions: [],
      location: location || 'Dungeon Path',
      summaryDelta: `${character?.name} evaluated the surroundings.`
    };
  }
}

export async function generateCharacterPortrait({ characterClass, description }) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/dm/generate-portrait', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ characterClass, description })
    });

    if (!res.ok) throw new Error('Failed to generate portrait');
    return await res.json();
  } catch (error) {
    console.warn('Falling back to local procedural portrait:', error);
    return {
      imageUrl: null,
      promptUsed: `${description}, ${characterClass}`,
      isFallback: true
    };
  }
}

export async function generateSceneIllustration({ sceneDescription, location, mood }) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/dm/generate-scene', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ sceneDescription, location, mood })
    });
    if (!res.ok) throw new Error('Failed to generate scene illustration');
    return await res.json();
  } catch (err) {
    console.warn('Scene illustration generation error:', err);
    return { imageUrl: null, isFallback: true };
  }
}

export async function generateCustomCampaign({ theme, difficulty, partyLevel, partyComposition }) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/dm/generate-campaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ theme, difficulty, partyLevel, partyComposition })
    });
    if (!res.ok) throw new Error('Failed to generate custom campaign');
    return await res.json();
  } catch (err) {
    console.warn('Custom campaign generation error:', err);
    return null;
  }
}

export async function searchDndSRD(query) {
  try {
    const res = await fetch(`/api/dnd/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function compressStorySummary({ currentSummary, recentEvents }) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/dm/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ currentSummary, recentEvents })
    });
    if (!res.ok) return { summary: currentSummary };
    return await res.json();
  } catch (e) {
    return { summary: currentSummary };
  }
}

export async function fetchLorebook() {
  try {
    const res = await fetch('/api/lorebook');
    if (!res.ok) throw new Error('Failed to fetch lorebook');
    const data = await res.json();
    return data.entries || [];
  } catch (e) {
    console.warn('Lorebook fetch fallback:', e);
    return [];
  }
}

export async function fetchMonsterData(name) {
  try {
    const res = await fetch(`/api/dnd/monster/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error('Monster lookup failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchSpellData(name) {
  try {
    const res = await fetch(`/api/dnd/spell/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error('Spell lookup failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchItemData(name) {
  try {
    const res = await fetch(`/api/dnd/item/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error('Item lookup failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

// =========================================================
// SESSION & PERSISTENCE API METHODS (PHASE 1)
// =========================================================

export async function fetchUserSessions() {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/sessions', {
      headers: authHeaders
    });
    if (!res.ok) throw new Error(`Failed to fetch sessions (${res.status})`);
    const data = await res.json();
    return data.sessions || [];
  } catch (err) {
    console.warn('[Session API] Error fetching sessions:', err);
    return [];
  }
}

export async function fetchSessionById(sessionId) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`/api/session/${encodeURIComponent(sessionId)}`, {
      headers: authHeaders
    });
    if (!res.ok) throw new Error(`Failed to load session (${res.status})`);
    const data = await res.json();
    return data.session;
  } catch (err) {
    console.error(`[Session API] Error loading session ${sessionId}:`, err);
    return null;
  }
}

export async function saveGameSession(sessionId, sessionData) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/session/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ sessionId, sessionData })
    });
    if (!res.ok) throw new Error(`Failed to save session (${res.status})`);
    const data = await res.json();
    return data.session;
  } catch (err) {
    console.error('[Session API] Error saving session:', err);
    return null;
  }
}

export async function autosaveGameSession(sessionId, sessionData) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/session/autosave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ sessionId, sessionData })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.session;
  } catch {
    return null;
  }
}

export async function deleteGameSession(sessionId) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`/api/session/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    if (!res.ok) throw new Error(`Failed to delete session (${res.status})`);
    return await res.json();
  } catch (err) {
    console.error(`[Session API] Error deleting session ${sessionId}:`, err);
    return { success: false };
  }
}

// =========================================================
// DETERMINISTIC RULES ENGINE API (PHASE 3)
// =========================================================

export async function rollAuthoritativeDice(notation = '1d20', options = {}) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/rules/roll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ notation, options })
    });
    if (!res.ok) throw new Error(`Roll failed (${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn('[Rules API] Fallback client roll:', err);
    const raw = Math.floor(Math.random() * 20) + 1;
    const mod = options.modifier || 0;
    return {
      notation,
      rolls: [raw],
      kept: [raw],
      modifier: mod,
      total: raw + mod,
      naturalValue: raw,
      isCrit: raw === 20,
      isCritFail: raw === 1
    };
  }
}

export async function executeServerCheck({
  character,
  ability = 'STR',
  skill = null,
  dc = 12,
  advantage = false,
  disadvantage = false,
  situationalBonus = 0
}) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/rules/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ character, ability, skill, dc, advantage, disadvantage, situationalBonus })
    });
    if (!res.ok) throw new Error(`Check failed (${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn('[Rules API] Fallback client check:', err);
    const raw = Math.floor(Math.random() * 20) + 1;
    return {
      ability,
      skill,
      dc,
      rolls: [raw],
      kept: [raw],
      naturalValue: raw,
      total: raw,
      success: raw >= dc,
      critical: raw === 20 ? 'success' : raw === 1 ? 'failure' : null
    };
  }
}

export async function resolveServerAttack({
  attacker,
  defender,
  attackBonus = 0,
  damageNotation = '1d8',
  damageType = 'slashing',
  advantage = false,
  disadvantage = false
}) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/rules/combat/attack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ attacker, defender, attackBonus, damageNotation, damageType, advantage, disadvantage })
    });
    if (!res.ok) throw new Error(`Attack resolution failed (${res.status})`);
    return await res.json();
  } catch (err) {
    console.error('[Rules API] Attack error:', err);
    return null;
  }
}

export async function performServerRest({ type = 'short', character, hitDiceToSpend = 1 }) {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/rules/rest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ type, character, hitDiceToSpend })
    });
    if (!res.ok) throw new Error(`Rest resolution failed (${res.status})`);
    return await res.json();
  } catch (err) {
    console.error('[Rules API] Rest error:', err);
    return null;
  }
}

