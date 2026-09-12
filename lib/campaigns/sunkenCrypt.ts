import { TacticalNode } from "../engine/tactical";

export interface QuestStage {
  act: number;
  name: string;
  locationName: string;
  description: string;
  ambiance: "dungeon_creepy" | "tavern_warm" | "battle_tense" | "crypt_solemn";
  objective: string;
  pointsOfInterest: {
    id: string;
    name: string;
    description: string;
    interactAction: string;
  }[];
  initialSuggestedActions: string[];
}

export interface TacticalMapLayout {
  width: number;
  height: number;
  nodes: Record<string, TacticalNode>;
  playerSpawns: { x: number; y: number }[];
  companionSpawns: { id: string; x: number; y: number }[];
  enemySpawns: { id: string; monsterKey: string; name: string; x: number; y: number }[];
}

export const SUNKEN_CRYPT_STAGES: Record<number, QuestStage> = {
  1: {
    act: 1,
    name: "The Forgotten Entrance",
    locationName: "Drowned Monastery Ruins",
    description: "Cold rainwater drips through the shattered vaulting of the drowned monastery. Ahead, a moss-grown stone staircase descends into absolute darkness where a heavy runic door stands sealed.",
    ambiance: "crypt_solemn",
    objective: "Investigate the sunken doorway and find a way through the sealed runic lock.",
    pointsOfInterest: [
      {
        id: "runic_door",
        name: "Runic Iron Door",
        description: "An ancient dwarven door carved with glowing runes of warding. An intricate dual-cylinder lock is embedded in the center.",
        interactAction: "Inspect the runic lock",
      },
      {
        id: "sunken_statue",
        name: "Statue of the Weeping Knight",
        description: "A moss-covered statue clutching a stone scabbard. Something metallic glints inside the broken plinth.",
        interactAction: "Examine the plinth",
      },
    ],
    initialSuggestedActions: [
      "Examine the runic door for traps or mechanisms",
      "Search the statue plinth for the missing key",
      "Have Vaelin pick the ancient lock with Thieves' Tools",
      "Have Sister Beatrice pray for divine guidance",
    ],
  },
  2: {
    act: 2,
    name: "The Flooded Ossuary",
    locationName: "The Flooded Ossuary",
    description: "An ankle-deep pool of black stagnant water covers the stone flags. Huddled atop a cracked sarcophagus is a drenched human in ragged leathers, clutching an unlit torch and trembling.",
    ambiance: "dungeon_creepy",
    objective: "Confront the trapped intruder, Aldous Fletcher, and glean what lies ahead.",
    pointsOfInterest: [
      {
        id: "aldous",
        name: "Aldous Fletcher (Grave Robber)",
        description: "A terrified thief whose lantern was smashed when the crypt guardians awoke.",
        interactAction: "Speak with Aldous",
      },
      {
        id: "bone_altar",
        name: "Desecrated Altar of Bones",
        description: "Human and beast skulls piled high around a chipped black onyx chalice.",
        interactAction: "Inspect the chalice",
      },
    ],
    initialSuggestedActions: [
      "Interrogate Aldous about who awakened the dead",
      "Offer him a healing potion in exchange for secret passages",
      "Inspect the bone altar for dark necromancy",
      "Press forward deeper into the antechamber",
    ],
  },
  3: {
    act: 3,
    name: "The Crypt Antechamber",
    locationName: "Catacomb Antechamber",
    description: "Ancient stone pillars support an arched vault hung with cobwebs. Suddenly, the click of bone against stone sounds from the shadows as skeletal sentinels raise rusted shortswords!",
    ambiance: "battle_tense",
    objective: "Defeat the skeleton sentinels on the tactical combat grid.",
    pointsOfInterest: [
      {
        id: "sarcophagus_1",
        name: "Ancient Stone Sarcophagus",
        description: "Provides half-cover (+2 AC) against ranged attacks.",
        interactAction: "Take cover behind the sarcophagus",
      },
    ],
    initialSuggestedActions: [
      "Engage the nearest skeleton with melee weapon",
      "Sister Beatrice: Cast Sacred Flame on the undead",
      "Vaelin: Flank the sentinels from behind the pillar",
      "Take cover behind the stone sarcophagus",
    ],
  },
  4: {
    act: 4,
    name: "The Tomb of the Wight Lord",
    locationName: "Sepulcher of the Wight Lord",
    description: "At the center of this vaulted chamber sits a throne carved from obsidian. Clad in blackened chainmail, the Lord of the Sunken Crypt rises, twin blue flames igniting in his hollow eye sockets!",
    ambiance: "battle_tense",
    objective: "Slay the Wight Lord before his Life Drain exhausts your party's vitality.",
    pointsOfInterest: [
      {
        id: "shadow_brazier",
        name: "Necrotic Flame Brazier",
        description: "Emanates a chilling aura that empowers the undead. Destroying or snuffing it might weaken the Wight.",
        interactAction: "Extinguish the brazier",
      },
    ],
    initialSuggestedActions: [
      "Strike the Wight Lord with full force",
      "Sister Beatrice: Channel Divinity against the undead",
      "Topple the necrotic brazier to extinguish his dark power",
      "Garrick: Intercept the Wight to protect Beatrice",
    ],
  },
};

export function generateTacticalMap(stage: number): TacticalMapLayout {
  const width = 10;
  const height = 8;
  const nodes: Record<string, TacticalNode> = {};

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = `${x},${y}`;
      // Boundary walls
      const isWall = x === 0 || x === width - 1 || y === 0 || y === height - 1;
      // Pillars at (3,2), (6,2), (3,5), (6,5)
      const isPillar = (x === 3 || x === 6) && (y === 2 || y === 5);
      // Sarcophagus at (4,3), (5,3)
      const isSarcophagus = (x === 4 || x === 5) && y === 3;
      // Water pool
      const isWater = (x === 1 || x === 2) && (y === 3 || y === 4);

      nodes[key] = {
        x,
        y,
        terrain: isWall
          ? "wall"
          : isPillar
          ? "pillar"
          : isSarcophagus
          ? "crypt_sarcophagus"
          : isWater
          ? "water"
          : "floor",
        providesCover: isWall
          ? "total"
          : isPillar
          ? "three_quarters"
          : isSarcophagus
          ? "half"
          : "none",
        isDifficultTerrain: isWater,
      };
    }
  }

  const playerSpawns = [{ x: 2, y: 6 }];
  const companionSpawns = [
    { id: "beatrice", x: 1, y: 6 },
    { id: "vaelin", x: 2, y: 5 },
    { id: "garrick", x: 3, y: 6 },
  ];

  let enemySpawns: { id: string; monsterKey: string; name: string; x: number; y: number }[] = [];
  if (stage === 3) {
    enemySpawns = [
      { id: "skel_1", monsterKey: "skeleton", name: "Skeleton Guard A", x: 4, y: 2 },
      { id: "skel_2", monsterKey: "skeleton", name: "Skeleton Guard B", x: 6, y: 2 },
      { id: "ghoul_1", monsterKey: "ghoul", name: "Crypt Ghoul", x: 5, y: 1 },
    ];
  } else if (stage === 4) {
    enemySpawns = [
      { id: "wight_lord", monsterKey: "wight", name: "Lord of the Sunken Crypt", x: 5, y: 2 },
      { id: "skel_minion_1", monsterKey: "skeleton", name: "Tomb Guard A", x: 3, y: 2 },
      { id: "skel_minion_2", monsterKey: "skeleton", name: "Tomb Guard B", x: 7, y: 2 },
    ];
  }

  return { width, height, nodes, playerSpawns, companionSpawns, enemySpawns };
}