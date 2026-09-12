import { eventBus, EVENTS } from './eventBus.js';

/**
 * 👥 Persistent NPC Simulation & Knowledge Boundaries
 * Models NPC schedules, emotional states, memory retrieval, and prevents AI omniscience.
 */

export const DEFAULT_NPCS = [
  {
    id: 'barnaby',
    name: 'Barnaby Stonebeard',
    role: 'Tavernkeeper & Veteran Sentinel',
    appearance: 'Broad-shouldered dwarf with a braided auburn beard and friendly laugh lines.',
    personality: 'Jovial, protective of patrons, observant, hates thieves.',
    faction: 'civilians',
    schedule: {
      morning: 'tavern_cellar',
      afternoon: 'tavern_taproom',
      evening: 'tavern_taproom',
      night: 'tavern_quarters'
    },
    knowledge: [
      { topic: 'whispering_crossroads', fact: 'Goblins have been ambushing grain carts near the old gibbet.', isSecret: false },
      { topic: 'iron_covenant', fact: 'The Covenant pays well for deserters, dead or alive.', isSecret: false },
      { topic: 'cellar_vault', fact: 'The cellar has a hidden stone tunnel sealed before the war.', isSecret: true }
    ],
    memories: [],
    emotionalState: 'content'
  },
  {
    id: 'vespera',
    name: 'Madame Vespera',
    role: 'Diviner & Card Reader',
    appearance: 'Mysterious tiefling woman draped in star-embroidered indigo silks with delicate obsidian horns.',
    personality: 'Enigmatic, speaks in omens, fascinated by ancient Netherese relics.',
    faction: 'arcanists',
    schedule: {
      morning: 'tavern_quarters',
      afternoon: 'tavern_taproom',
      evening: 'tavern_hearth',
      night: 'tavern_taproom'
    },
    knowledge: [
      { topic: 'sunken_crypt', fact: 'The Crypt of Oros holds the Crown of the Ash Sovereign, but the waters are cursed.', isSecret: false },
      { topic: 'planar_rifts', fact: 'Arcane fluctuations in the woods herald an eclipse of Netheril.', isSecret: true }
    ],
    memories: [],
    emotionalState: 'mysterious'
  },
  {
    id: 'valdris',
    name: 'Inquisitor Valdris',
    role: 'Iron Covenant Officer',
    appearance: 'Tall human in polished blackened steel plate bearing the flaming hammer crest.',
    personality: 'Ruthless, unyielding, values law and obedience above mercy.',
    faction: 'iron_covenant',
    schedule: {
      morning: 'crossroads_outpost',
      afternoon: 'crossroads_gibbet',
      evening: 'crossroads_outpost',
      night: 'crossroads_barracks'
    },
    knowledge: [
      { topic: 'deserter', fact: 'Private Kenneth stole an enchanted covenant dispatch and fled west.', isSecret: false },
      { topic: 'covenant_orders', fact: 'Authorized to execute any who harbor military fugitives.', isSecret: false }
    ],
    memories: [],
    emotionalState: 'stern'
  },
  {
    id: 'thorngrim',
    name: 'Master Thorngrim',
    role: 'Runic Blacksmith',
    appearance: 'Grizzled dwarf with singed leathers and calloused hands etched with anvil soot.',
    personality: 'Gruff, honest, respects martial discipline and quality metallurgy.',
    faction: 'civilians',
    schedule: {
      morning: 'outpost_forge',
      afternoon: 'outpost_forge',
      evening: 'tavern_taproom',
      night: 'outpost_forge'
    },
    knowledge: [
      { topic: 'weapons', fact: 'Silvered weapons deal full damage to shadow wraiths and specters.', isSecret: false },
      { topic: 'runic_steel', fact: 'Dragonscale steel requires magma from the Caldera to quench properly.', isSecret: true }
    ],
    memories: [],
    emotionalState: 'focused'
  }
];

// Persistent runtime NPC registry
let npcRegistry = new Map();

export function initializeNpcSimulation(customNpcs = null) {
  npcRegistry.clear();
  const pool = customNpcs && customNpcs.length > 0 ? customNpcs : DEFAULT_NPCS;
  pool.forEach(npc => {
    npcRegistry.set(npc.id, JSON.parse(JSON.stringify(npc)));
  });
}

// Auto-initialize on module load
initializeNpcSimulation();

export function getNpc(npcId) {
  return npcRegistry.get(npcId) || null;
}

export function getAllNpcs() {
  return Array.from(npcRegistry.values());
}

export function getNpcLocation(npcId, timeOfDay = 'afternoon') {
  const npc = getNpc(npcId);
  if (!npc) return null;
  return npc.schedule[timeOfDay] || npc.schedule.afternoon || 'tavern_taproom';
}

export function getNpcsAtLocation(locationId, timeOfDay = 'afternoon') {
  const matching = [];
  for (const npc of npcRegistry.values()) {
    const currentLoc = getNpcLocation(npc.id, timeOfDay);
    if (currentLoc === locationId || (locationId === 'tavern' && currentLoc.startsWith('tavern'))) {
      matching.push(npc);
    }
  }
  return matching;
}

export function recordNpcMemory(npcId, { event, importance = 0.5, location = 'tavern', participants = [], consequences = [] }) {
  const npc = getNpc(npcId);
  if (!npc) return null;

  const memory = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    event,
    importance,
    location,
    participants,
    consequences,
    timestamp: new Date().toISOString()
  };

  npc.memories = [memory, ...npc.memories].slice(0, 20); // Keep top 20 memories
  return memory;
}

export function queryNpcKnowledge(npcId, topicQuery = '') {
  const npc = getNpc(npcId);
  if (!npc) return [];

  const query = (topicQuery || '').toLowerCase();
  return npc.knowledge.filter(k => {
    return k.topic.toLowerCase().includes(query) || k.fact.toLowerCase().includes(query);
  });
}
