import { generateMockTurn } from './mockDM.js';
import { buildStoryConstraints } from './storyGuardrails.js';
import { advanceWorldState } from './storyEngine.js';
import { getMonster } from './dndDataService.js';
import { matchAndInjectLore, registerNewCodexEntries } from './lorebookService.js';

/**
 * Genre & Tone Modifier generator
 */
function getGenreDirectives(questTag = '') {
  const tag = (questTag || '').toLowerCase();
  if (tag.includes('bounty') || tag.includes('combat')) {
    return 'GENRE: Action-Forward Bounty. Keep pacing fast, highlight visceral combat stakes and tactical positioning.';
  }
  if (tag.includes('mystery') || tag.includes('investigation')) {
    return 'GENRE: Investigation & Intrigue. Drop subtle environmental clues, tracks, suspect contradictions, and investigation opportunities (INT/WIS).';
  }
  if (tag.includes('exploration') || tag.includes('otherworldly')) {
    return 'GENRE: Wonder & Exploration. Emphasize ancient architecture, magical anomalies, terrain survival challenges, and discovery rewards.';
  }
  if (tag.includes('social')) {
    return 'GENRE: High-Stakes Social & Diplomacy. Focus on NPC motivations, body language, parleys, bribery, and charisma negotiation.';
  }
  if (tag.includes('boss') || tag.includes('battle')) {
    return 'GENRE: Epic Boss Raid. Multi-phase escalating threat, monumental environmental hazards, and coordinated party actions.';
  }
  return 'GENRE: Tabletop Fantasy Adventure. Rich atmospheric balance of mystery, danger, and heroism.';
}

export async function narrateTurn(turnPayload) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return generateMockTurn(turnPayload);
  }

  try {
    const {
      character,
      companions = [],
      action,
      actionType = 'do',
      quest,
      location,
      checkResult,
      history = [],
      storySummary = '',
      worldState = {}
    } = turnPayload;

    const storyConstraints = buildStoryConstraints(worldState, quest);
    const genreDirective = getGenreDirectives(quest?.tag);

    // World Codex / Lorebook Keyword matching
    const searchContext = `${action} ${location} ${quest?.title || ''} ${storySummary}`;
    const { injectedText: lorebookContext } = matchAndInjectLore(searchContext);

    // Pre-fetch SRD monster reference if mentioned
    let srdContext = '';
    if (quest?.monsters && quest.monsters.length > 0) {
      try {
        const monsterData = await getMonster(quest.monsters[0]);
        if (monsterData) {
          srdContext = `
D&D 5E SRD REFERENCE DATA:
- Enemy: ${monsterData.name} (AC: ${monsterData.ac}, HP: ${monsterData.hp}, CR: ${monsterData.cr})
- Traits: ${(monsterData.traits || []).map(t => `${t.name}: ${t.desc}`).join(' | ')}
- Actions: ${monsterData.actions?.map(a => `${a.name}: ${a.desc}`).join(' | ')}
`;
        }
      } catch (e) {}
    }

    const companionsContext = companions.length > 0
      ? companions.map(c => `- ${c.name} (${c.class}, ${c.role}): HP ${c.hp}/${c.maxHp}, Affinity: ${c.approval || 50}/100, Trait: "${c.personality?.trait}", Priority: "${c.combatPriority}"`).join('\n')
      : 'None (Solo Adventurer)';

    let actionModeDirective = '';
    if (actionType === 'say') {
      actionModeDirective = `ACTION MODE [SAY]: The player spoke dialogue: "${action}". Emphasize NPC dialogue replies, vocal tone, body language, and immediate social reactions.`;
    } else if (actionType === 'story') {
      actionModeDirective = `ACTION MODE [STORY/DIRECTOR]: The player directly guided world events: "${action}". Seamlessly incorporate this narrative development into the scene.`;
    } else {
      actionModeDirective = `ACTION MODE [DO]: The player takes action: "${action}". Describe the physical attempt, stakes, and immediate environment reactions.`;
    }

    const systemPrompt = `
You are the Dungeon Master for "The Wayward Flagon", an authored tabletop RPG.
Core Rules:
1. Narrate strictly in 2 to 5 sentences. Never a wall of text. ALWAYS conclude with an actionable situation for the player.
2. ${genreDirective}
${actionModeDirective}
${storyConstraints}
${lorebookContext}
${srdContext}
3. Check Protocol: If action outcome is uncertain, dangerous, or requires skill, specify a check object (ability, dc, reason). If a check was just rolled (${checkResult ? `Result: ${checkResult.total} vs DC ${checkResult.dc} - ${checkResult.isSuccess ? 'SUCCESS' : 'FAILURE'}` : 'None'}), narrate the direct outcome and advance the scene.
4. Companion Protocol: The party has 2 AI companions. Companions act AFTER player resolution according to their combatPriority. Return affinity changes when player decisions align with or conflict with companion morals.
5. Always generate a 1-sentence "sceneHint" describing the visual environment for 16:9 illustration.
6. If introducing a notable named NPC, location, relic, monster or faction for the first time, include them in "newCodexEntries".

Respond STRICTLY with a valid JSON object matching this schema:
{
  "narration": "2 to 5 sentences of vivid atmospheric narration ending with an actionable hook.",
  "sceneHint": "1 sentence visual description of the environment, lighting, and architecture for 16:9 concept art",
  "quickActions": ["Action 1", "Action 2", "Action 3", "Action 4"],
  "check": null OR { "ability": "STR"|"DEX"|"CON"|"INT"|"WIS"|"CHA", "dc": number, "reason": "Reason string" },
  "hpChange": number (damage negative, healing positive, 0 for none),
  "goldChange": number,
  "loot": ["Item name"],
  "location": "Updated location string if changed, else null",
  "companionActions": [
    { "name": "Companion Name", "action": "Tactical action description", "dialogue": "Short in-character quote" or null }
  ],
  "affinityChanges": [
    { "companion": "Companion Name", "delta": number (-5 to +10), "reason": "Brief reason" }
  ],
  "newCodexEntries": [
    { "id": "entry_id", "title": "Name", "category": "Locations"|"NPCs"|"Factions"|"Relics"|"Monsters", "description": "1 sentence summary", "keywords": ["keyword1"] }
  ],
  "flagsSet": ["optional_flag_name"],
  "storyBeat": "EXPLORATION" | "COMBAT" | "PUZZLE" | "SOCIAL" | "BOSS" | "REST" | "RESOLUTION",
  "summaryDelta": "1 concise sentence summarizing what happened this turn"
}
`;

    const contextPrompt = `
CURRENT PARTY & STATE:
- Player: ${character?.name} (${character?.class}), HP: ${character?.hp}/${character?.maxHp}, Gold: ${character?.gold}
- Stats: STR: ${character?.stats?.STR}, DEX: ${character?.stats?.DEX}, CON: ${character?.stats?.CON}, INT: ${character?.stats?.INT}, WIS: ${character?.stats?.WIS}, CHA: ${character?.stats?.CHA}
- Inventory: ${(character?.inventory || []).join(', ')}
- AI Companions:
${companionsContext}
- Location: ${location || 'The Wayward Flagon'}
- Active Quest: ${quest ? `${quest.title} (Stage ${worldState.questStage || 1}) - ${quest.description}` : 'Exploring freely'}
- Chronicle Summary: ${storySummary || 'The expedition has just set out.'}

RECENT TURNS:
${history.slice(-4).map(h => `${h.role === 'user' ? 'Player' : h.role === 'companion' ? `Companion (${h.companionName})` : 'DM'}: ${h.content}`).join('\n')}

LATEST PLAYER INPUT (${actionType.toUpperCase()}):
${checkResult ? `[CHECK RESOLVED: ${checkResult.ability} total ${checkResult.total} vs DC ${checkResult.dc} - ${checkResult.isSuccess ? 'SUCCESS' : 'FAILURE'} (Crit: ${checkResult.isCritSuccess || checkResult.isCritFail}). Player original intent: "${action}"]` : `Action: "${action}"`}
`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.75,
          maxOutputTokens: 950
        }
      })
    });

    if (!res.ok) {
      console.warn(`[Gemini API] Returned status ${res.status}. Using simulation fallback.`);
      return generateMockTurn(turnPayload);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
    const parsed = JSON.parse(rawText);

    // Register any new codex discoveries
    if (parsed.newCodexEntries && Array.isArray(parsed.newCodexEntries)) {
      registerNewCodexEntries(parsed.newCodexEntries);
    }

    // Update world state machine
    const nextWorldState = advanceWorldState(worldState, parsed);

    return {
      narration: parsed.narration || 'The dungeon waits silently. What do you do next?',
      sceneHint: parsed.sceneHint || `${location} under flickering firelight and ancient stonework.`,
      quickActions: Array.isArray(parsed.quickActions) ? parsed.quickActions : ['Look around', 'Move forward', 'Ready weapon', 'Listen'],
      check: parsed.check || null,
      hpChange: typeof parsed.hpChange === 'number' ? parsed.hpChange : 0,
      goldChange: typeof parsed.goldChange === 'number' ? parsed.goldChange : 0,
      loot: Array.isArray(parsed.loot) ? parsed.loot : [],
      location: parsed.location || location,
      companionActions: Array.isArray(parsed.companionActions) ? parsed.companionActions : [],
      affinityChanges: Array.isArray(parsed.affinityChanges) ? parsed.affinityChanges : [],
      newCodexEntries: Array.isArray(parsed.newCodexEntries) ? parsed.newCodexEntries : [],
      flagsSet: Array.isArray(parsed.flagsSet) ? parsed.flagsSet : [],
      storyBeat: parsed.storyBeat || 'EXPLORATION',
      worldState: nextWorldState,
      summaryDelta: parsed.summaryDelta || `${character?.name} took an action in ${location}.`
    };
  } catch (error) {
    console.error('[DM Engine Error] Falling back to mock engine:', error.message);
    return generateMockTurn(turnPayload);
  }
}

/**
 * Intelligent Narrative Summarizer using Gemini
 */
export async function summarizeWithGemini(currentSummary = '', recentEvents = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  const combined = `${currentSummary ? currentSummary + '\n' : ''}${recentEvents.join('\n')}`;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return combined.slice(-1200);
  }

  try {
    const prompt = `
Compress the following adventure chronicle into a tight, coherent 150-word running summary.
Preserve key events, NPC names, discovered items, and current quest milestones. Do NOT invent new facts.
Chronicle:
${combined}
`;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.3 }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text.slice(0, 1200);
    }
  } catch (e) {}

  return combined.slice(-1200);
}
