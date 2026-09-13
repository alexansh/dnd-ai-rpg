export interface LoreEntry {
  id: string;
  keys: string[]; // Primary trigger keywords (case-insensitive)
  secondaryKeys?: string[]; // NovelAI-style AND logic: at least one secondary key must also be present
  content: string; // Compact lore facts
  priority: number; // 1-100, higher gets included first
  alwaysActive?: boolean; // Always injected regardless of keyword match
  category: "npc" | "location" | "faction" | "item" | "plot-thread" | "world-rule";
}

export const SEED_LOREBOOK: LoreEntry[] = [
  {
    id: "world_rule_dnd5e",
    keys: ["rule", "mechanic", "5e", "d20"],
    content: "D&D 5e SRD Rules apply strictly. Checks require numeric rolls. Magic follows spell slots. Death saves: 3 successes stabilize, 3 failures slay.",
    priority: 100,
    alwaysActive: true,
    category: "world-rule",
  },
  {
    id: "loc_sunken_crypt",
    keys: ["crypt", "sunken crypt", "ruins", "tomb", "dungeon", "entrance", "catacombs"],
    content: "The Sunken Crypt: An ancient flooded necropolis built during the First Age of Man, sacred to Azgarth, now corrupted by necromantic blight.",
    priority: 90,
    category: "location",
  },
  {
    id: "npc_wight_lord",
    keys: ["wight", "wight lord", "lord", "master", "undead", "boss", "curse"],
    content: "Lord Malakor the Wight: Former paladin of the Silver Guard, entombed with his relic blade, now an undead warlord wielding Life Drain.",
    priority: 85,
    category: "npc",
  },
  {
    id: "npc_aldous_fletcher",
    keys: ["aldous", "fletcher", "rogue", "thief", "prisoner", "cage", "ossuary"],
    content: "Aldous Fletcher: Cynical tomb-robber trapped in the Flooded Ossuary. Knows the secret passage past the spiked portcullis.",
    priority: 80,
    category: "npc",
  },
  {
    id: "npc_sister_beatrice",
    keys: ["beatrice", "cleric", "dawnmother", "sister", "healer"],
    content: "Sister Beatrice: Life Cleric of the Dawnmother. Devoted to purging necrotic blight and shielding allies with radiant miracles.",
    priority: 75,
    category: "npc",
  },
  {
    id: "npc_vaelin",
    keys: ["vaelin", "shadowstep", "scout", "assassin", "flanking"],
    content: "Vaelin Shadowstep: Pragmatic scout and rogue who hunts flanking angles for sneak attacks and checks for pressure plates.",
    priority: 75,
    category: "npc",
  },
  {
    id: "npc_garrick",
    keys: ["garrick", "stonefist", "fighter", "guard", "veteran"],
    content: "Garrick Stonefist: Veteran vanguard of the Silver Guard. Holds chokepoints and protects allies with martial discipline.",
    priority: 75,
    category: "npc",
  },
  {
    id: "faction_dawnmother",
    keys: ["dawnmother", "sun", "radiant", "faith", "light"],
    content: "The Church of the Dawnmother: Revering the Golden Dawn, sworn enemies of undead corruption and shadow magic.",
    priority: 70,
    category: "faction",
  },
  {
    id: "faction_silver_guard",
    keys: ["silver guard", "knights", "order", "oath", "guard"],
    content: "The Silver Guard: An ancient knighthood who once garrisoned the borderlands, whose fallen brothers still guard these halls as restless wights.",
    priority: 70,
    category: "faction",
  },
];

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export function scanLorebook(
  textBuffer: string,
  entries: LoreEntry[] = SEED_LOREBOOK,
  tokenBudget: number = 600
): { matchedEntries: LoreEntry[]; tokensUsed: number } {
  const lowerBuffer = textBuffer.toLowerCase();
  const matched: LoreEntry[] = [];

  for (const entry of entries) {
    if (entry.alwaysActive) {
      matched.push(entry);
      continue;
    }

    // Check primary keys
    const primaryMatch = entry.keys.some((k) => lowerBuffer.includes(k.toLowerCase()));
    if (!primaryMatch) continue;

    // Check secondary keys if present (NovelAI AND logic)
    if (entry.secondaryKeys && entry.secondaryKeys.length > 0) {
      const secondaryMatch = entry.secondaryKeys.some((sk) => lowerBuffer.includes(sk.toLowerCase()));
      if (!secondaryMatch) continue;
    }

    matched.push(entry);
  }

  // Sort: alwaysActive first, then by priority descending
  matched.sort((a, b) => {
    if (a.alwaysActive && !b.alwaysActive) return -1;
    if (!a.alwaysActive && b.alwaysActive) return 1;
    return b.priority - a.priority;
  });

  // Fit within token budget
  const accepted: LoreEntry[] = [];
  let currentTokens = 0;

  for (const entry of matched) {
    const entryTokens = estimateTokenCount(entry.content);
    if (currentTokens + entryTokens <= tokenBudget) {
      accepted.push(entry);
      currentTokens += entryTokens;
    }
  }

  return {
    matchedEntries: accepted,
    tokensUsed: currentTokens,
  };
}
