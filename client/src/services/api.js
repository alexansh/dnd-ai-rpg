/**
 * Client API Service to communicate strictly with the Express backend proxy
 */

export async function checkServerHealth() {
  try {
    const res = await fetch('/api/health');
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
    const res = await fetch('/api/dm/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch('/api/dm/generate-portrait', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch('/api/dm/generate-scene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch('/api/dm/generate-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch('/api/dm/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentSummary, recentEvents })
    });
    if (!res.ok) return { summary: currentSummary };
    return await res.json();
  } catch (e) {
    return { summary: currentSummary };
  }
}
