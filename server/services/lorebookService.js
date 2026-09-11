/**
 * World Codex & Lorebook Service
 * Manages persistent world knowledge across Locations, NPCs, Factions, Relics, and Monsters.
 * Automatically matches keywords in player prompts to inject relevant lore into the AI DM context.
 */

export const DEFAULT_CODEX_ENTRIES = [
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
  },
  {
    id: 'faction_cult_of_the_eclipse',
    title: 'Cult of the Void Eclipse',
    category: 'Factions',
    keywords: ['eclipse', 'void', 'cult', 'cultist', 'shadow rites', 'aberration'],
    description: 'A clandestine cabal of nihilistic zealots attempting to unseal cosmic entities from the Astral void by corrupting ancient leylines.',
    discovered: false
  },
  {
    id: 'relic_astral_compass',
    title: 'The Astral Astrolabe',
    category: 'Relics',
    keywords: ['astrolabe', 'compass', 'planar', 'navigation', 'astral'],
    description: 'An intricately geared brass sphere that points not to magnetic north, but toward planar rifts, hidden doorways, and wells of wild magic.',
    discovered: false
  }
];

let lorebookStore = [...DEFAULT_CODEX_ENTRIES];

export function getLorebook() {
  return lorebookStore;
}

export function resetLorebook() {
  lorebookStore = [...DEFAULT_CODEX_ENTRIES];
  return lorebookStore;
}

export function matchAndInjectLore(contextText = '') {
  const lowerText = contextText.toLowerCase();
  const matchedEntries = [];

  lorebookStore.forEach(entry => {
    const isMatched = entry.keywords.some(kw => lowerText.includes(kw.toLowerCase()));
    if (isMatched) {
      entry.discovered = true;
      matchedEntries.push(entry);
    }
  });

  if (matchedEntries.length === 0) return { injectedText: '', matchedEntries: [] };

  const injectedText = `
=== WORLD CODEX RELEVANT LORE ===
${matchedEntries.map(e => `[${e.category.toUpperCase()}] ${e.title}: ${e.description}`).join('\n')}
=================================
`;

  return { injectedText, matchedEntries };
}

export function registerNewCodexEntries(entries = []) {
  if (!Array.isArray(entries)) return [];
  const added = [];

  entries.forEach(newEntry => {
    if (!newEntry.title || !newEntry.category) return;
    const exists = lorebookStore.some(e => e.title.toLowerCase() === newEntry.title.toLowerCase());
    if (!exists) {
      const entry = {
        id: newEntry.id || `codex_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: newEntry.title,
        category: newEntry.category || 'Locations',
        keywords: Array.isArray(newEntry.keywords) ? newEntry.keywords : [newEntry.title.toLowerCase()],
        description: newEntry.description || 'A mysterious element discovered in the realm.',
        discovered: true
      };
      lorebookStore.push(entry);
      added.push(entry);
    }
  });

  return added;
}
