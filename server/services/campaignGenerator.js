/**
 * Dynamic AI World & Campaign Generator
 * Generates rich, authored, 2D Baldur's Gate 3-style world bibles and interactive maps
 * with SRD data and Gemini assistance.
 */

const THEME_SCENE_MAP = {
  'Gothic Catacombs': { env: 'crypt', bg: '/assets/images/scenery/crypt.jpg', mood: 'dungeon_suspense' },
  'Dungeon Crawl': { env: 'crypt', bg: '/assets/images/scenery/crypt.jpg', mood: 'dungeon_suspense' },
  'Undead Siege': { env: 'crypt', bg: '/assets/images/scenery/crypt.jpg', mood: 'dungeon_suspense' },
  'Volcanic Crags': { env: 'mountains', bg: '/assets/images/scenery/mountains.jpg', mood: 'exploration_wonder' },
  'Dragon Hunt': { env: 'mountains', bg: '/assets/images/scenery/mountains.jpg', mood: 'exploration_wonder' },
  'Enchanted Feywild': { env: 'feywilds', bg: '/assets/images/scenery/feywilds.jpg', mood: 'exploration_wonder' },
  'Forest Expedition': { env: 'feywilds', bg: '/assets/images/scenery/feywilds.jpg', mood: 'exploration_wonder' },
  'Sunken Pirate Cove': { env: 'cove', bg: '/assets/images/scenery/cove.jpg', mood: 'dungeon_suspense' },
  'Coastal Raid': { env: 'cove', bg: '/assets/images/scenery/cove.jpg', mood: 'dungeon_suspense' },
  'Urban Mystery': { env: 'tavern', bg: '/assets/images/scenery/tavern.jpg', mood: 'tavern_calm' },
  'Infernal Wastelands': { env: 'mountains', bg: '/assets/images/scenery/mountains.jpg', mood: 'combat_epic' }
};

export async function generateCampaign({
  theme = 'Gothic Catacombs',
  promptInput = '',
  difficulty = 'Balanced',
  partyLevel = 1,
  partyComposition = ['Warrior', 'Cleric', 'Rogue']
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const themeConfig = THEME_SCENE_MAP[theme] || THEME_SCENE_MAP['Gothic Catacombs'];

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
      const prompt = `
You are the lead world designer for an epic D&D 5e / Baldur's Gate 3-style 2D fantasy RPG called "The Wayward Flagon".
Generate a rich, cohesive World & Campaign Bible.

Player Parameters:
- Custom World Prompt: "${promptInput || theme}"
- Chosen Theme/Biome: ${theme}
- Difficulty: ${difficulty}
- Party Level: ${partyLevel} (Composed of: ${partyComposition.join(', ')})

Respond ONLY with valid JSON matching this exact structure:
{
  "id": "world-${Date.now()}",
  "title": "Evocative, memorable campaign title",
  "subtitle": "Dramatic thematic tagline (e.g. 'Gothic Dungeon Crawl & Undead Uprising')",
  "difficulty": "${difficulty}",
  "recommendedLevel": "Level ${partyLevel}–${partyLevel + 3}",
  "environment": "${themeConfig.env}",
  "bgImage": "${themeConfig.bg}",
  "initialMood": "${themeConfig.mood}",
  "initialIntensity": 2,
  "description": "3-4 atmospheric sentences detailing the world's lore, crisis, and call to arms.",
  "mainNemesis": "Name and brief title of the campaign's ultimate villain",
  "majorFactions": [
    { "name": "Faction 1", "disposition": "Friendly / Hostile / Neutral", "goal": "Their agenda" },
    { "name": "Faction 2", "disposition": "Friendly / Hostile / Neutral", "goal": "Their agenda" }
  ],
  "mainQuest": "Core overarching objective to resolve the crisis",
  "acts": [
    { "act": 1, "name": "Act I: The Incursion", "objective": "Investigate initial disturbances and secure allies" },
    { "act": 2, "name": "Act II: The Escalation", "objective": "Infiltrate enemy territory and dismantle their power sources" },
    { "act": 3, "name": "Act III: The Reckoning", "objective": "Confront the main nemesis in their sanctum" }
  ],
  "startingNodes": [
    {
      "id": "node_entry",
      "name": "Starting Outpost / Threshold",
      "description": "Vivid 1-sentence atmosphere of this location.",
      "type": "outpost",
      "x": 20,
      "y": 50,
      "connectedTo": ["node_ruins", "node_grove"],
      "unlocked": true
    },
    {
      "id": "node_grove",
      "name": "Mystic Shrine or Wilderness Waypoint",
      "description": "Vivid 1-sentence atmosphere.",
      "type": "shrine",
      "x": 45,
      "y": 25,
      "connectedTo": ["node_entry", "node_dungeon"],
      "unlocked": false
    },
    {
      "id": "node_ruins",
      "name": "Forgotten Ruins / Underhollow",
      "description": "Vivid 1-sentence atmosphere.",
      "type": "dungeon",
      "x": 50,
      "y": 75,
      "connectedTo": ["node_entry", "node_boss"],
      "unlocked": false
    },
    {
      "id": "node_dungeon",
      "name": "Inner Stronghold",
      "description": "Vivid 1-sentence atmosphere.",
      "type": "dungeon",
      "x": 75,
      "y": 35,
      "connectedTo": ["node_grove", "node_boss"],
      "unlocked": false
    },
    {
      "id": "node_boss",
      "name": "Nemesis Citadel / Altar",
      "description": "Vivid 1-sentence atmosphere of the final battleground.",
      "type": "boss",
      "x": 90,
      "y": 60,
      "connectedTo": ["node_ruins", "node_dungeon"],
      "unlocked": false
    }
  ],
  "companionSpawns": ["thalia", "grimjaw", "morwen", "vaelin"],
  "hotspots": [
    { "id": "hs_1", "label": "Ancient Relic Altar", "type": "altar", "check": "INT", "dc": 12, "inspect": "Pulsing runes etched into stone." },
    { "id": "hs_2", "label": "Locked Strongbox", "type": "chest", "check": "DEX", "dc: 13, "inspect": "Iron-banded lockbox half-buried in dust." },
    { "id": "hs_3", "label": "Sentry Patrol", "type": "enemy", "check": "STR", "dc": 11, "inspect": "Armored hostile ready to strike." }
  ],
  "rewardGold": 120,
  "rewardItem": "Legendary Artifact Name"
}
`;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.85 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            ...parsed,
            id: `ai-world-${Date.now()}`,
            environment: parsed.environment || themeConfig.env,
            bgImage: parsed.bgImage || themeConfig.bg,
            initialMood: parsed.initialMood || themeConfig.mood
          };
        }
      }
    } catch (e) {
      console.warn('[World Generator] Gemini fallback triggered:', e.message);
    }
  }

  // High-fidelity procedural fallback worlds
  const sanitizedPrompt = (promptInput || theme).trim();
  const worldId = `world-${Date.now()}`;

  return {
    id: worldId,
    title: promptInput ? `Chronicle of ${sanitizedPrompt}` : `The Siege of ${theme} Realm`,
    subtitle: `${theme} Saga • Baldur's Gate Tactical Campaign`,
    difficulty,
    recommendedLevel: `Level ${partyLevel}–${partyLevel + 3}`,
    environment: themeConfig.env,
    bgImage: themeConfig.bg,
    initialMood: themeConfig.mood,
    initialIntensity: 2,
    description: `A mysterious anomaly has unsettled the borders of ${sanitizedPrompt}. Ancient wardstones are shattering under malevolent pressure, and dark factions gather in the shadows. Assemble your trusted party at The Wayward Flagon and forge your path through the uncharted realm.`,
    mainNemesis: 'Malakor the Dread-Weaver',
    majorFactions: [
      { name: 'Order of the Sunken Beacon', disposition: 'Friendly', goal: 'Restore the ancient planar seals' },
      { name: 'The Ashen Covenant', disposition: 'Hostile', goal: 'Unleash primordial dark energy' }
    ],
    mainQuest: `Journey across the nodes of ${sanitizedPrompt} and defeat the shadow sovereign before darkness consumes the frontier.`,
    acts: [
      { act: 1, name: 'Act I: The Ruptured Threshold', objective: 'Secure the forward outpost and scout enemy movements' },
      { act: 2, name: 'Act II: The Shattered Leyline', objective: 'Purge the corrupted sanctum and unbind captured allies' },
      { act: 3, name: 'Act III: The Eclipse Citadel', objective: 'Storm the sovereign vault and destroy the necrotic core' }
    ],
    startingNodes: [
      {
        id: 'node_entry',
        name: 'The Shattered Threshold',
        description: 'Weathered stone archways guarding the outer border.',
        type: 'outpost',
        x: 18,
        y: 50,
        connectedTo: ['node_grove', 'node_ruins'],
        unlocked: true
      },
      {
        id: 'node_grove',
        name: 'Whispering Waypoint Shrine',
        description: 'An ancient carved monolith bathed in ethereal candlelight.',
        type: 'shrine',
        x: 42,
        y: 28,
        connectedTo: ['node_entry', 'node_dungeon'],
        unlocked: false
      },
      {
        id: 'node_ruins',
        name: 'Sunken Catacomb Caverns',
        description: 'Echoing subterranean halls teeming with hidden traps and relics.',
        type: 'dungeon',
        x: 48,
        y: 72,
        connectedTo: ['node_entry', 'node_boss'],
        unlocked: false
      },
      {
        id: 'node_dungeon',
        name: 'Fortress Underhollow',
        description: 'The fortified staging grounds of the enemy vanguard.',
        type: 'dungeon',
        x: 74,
        y: 35,
        connectedTo: ['node_grove', 'node_boss'],
        unlocked: false
      },
      {
        id: 'node_boss',
        name: "Dread-Weaver's Sanctum",
        description: 'The obsidian throne room overlooking the vortex of doom.',
        type: 'boss',
        x: 88,
        y: 58,
        connectedTo: ['node_ruins', 'node_dungeon'],
        unlocked: false
      }
    ],
    companionSpawns: ['thalia', 'grimjaw', 'morwen', 'vaelin', 'zephyr', 'lyra'],
    hotspots: [
      { id: 'world_altar', label: 'Leyline Altar', type: 'altar', check: 'INT', dc: 12, inspect: 'Humming celestial crystals radiating warmth.' },
      { id: 'world_chest', label: 'Reinforced Vault Box', type: 'chest', check: 'DEX', dc: 13, inspect: 'Engraved steel chest requiring delicate lockpicking.' },
      { id: 'world_vanguard', label: 'Covenant Enforcer', type: 'enemy', check: 'STR', dc: 12, inspect: 'Heavy iron-clad berserker blocking the road.' }
    ],
    rewardGold: 140,
    rewardItem: 'Sun-forged Signet of the Realm'
  };
}

