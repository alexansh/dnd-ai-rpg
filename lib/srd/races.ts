import { CharacterRaceDefinition } from "./types";

export const SRD_RACES: Record<string, CharacterRaceDefinition> = {
  human: {
    id: "human",
    name: "Human",
    speed: 30,
    size: "Medium",
    abilityScoreIncreases: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    traits: [
      { name: "Versatility", description: "Humans are adaptable, ambitious, and innovators among the mortal races." }
    ],
    description: "The most adaptable and ambitious people among the common races.",
    portraitDescriptor: "human adventurer with determined weathered facial features, rugged skin, focused gaze",
  },
  elf: {
    id: "elf",
    name: "High Elf",
    speed: 30,
    size: "Medium",
    abilityScoreIncreases: { dex: 2, int: 1 },
    traits: [
      { name: "Darkvision", description: "Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions (60 ft)." },
      { name: "Fey Ancestry", description: "Advantage on saving throws against being charmed, and magic can't put you to sleep." }
    ],
    description: "Elegance, deep magical affinity, and graceful grace of the ancient realm.",
    portraitDescriptor: "high elf adventurer with long pointed ears angled backward, ethereal cheekbones, luminous almond eyes",
  },
  dwarf: {
    id: "dwarf",
    name: "Mountain Dwarf",
    speed: 25,
    size: "Medium",
    abilityScoreIncreases: { str: 2, con: 2 },
    traits: [
      { name: "Darkvision", description: "Vision up to 60 ft in total darkness." },
      { name: "Dwarven Resilience", description: "Advantage on saving throws against poison, and resistance against poison damage." }
    ],
    description: "Bold, hardy, and renowned as master craftsmen and indomitable warriors.",
    portraitDescriptor: "mountain dwarf adventurer with wide stone-hewn brow, thick braided beard clasped with runic iron, deep-set determined eyes",
  },
  halfling: {
    id: "halfling",
    name: "Lightfoot Halfling",
    speed: 25,
    size: "Small",
    abilityScoreIncreases: { dex: 2, cha: 1 },
    traits: [
      { name: "Lucky", description: "When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll." },
      { name: "Brave", description: "Advantage on saving throws against being frightened." }
    ],
    description: "Comfortable, cheerful folk whose courage belies their small stature.",
    portraitDescriptor: "lightfoot halfling adventurer with youthful features, curly locks, warm courageous smile",
  },
  tiefling: {
    id: "tiefling",
    name: "Tiefling",
    speed: 30,
    size: "Medium",
    abilityScoreIncreases: { cha: 2, int: 1 },
    traits: [
      { name: "Darkvision", description: "Superior vision in dark and dim conditions (60 ft)." },
      { name: "Hellish Resistance", description: "Resistance to fire damage." }
    ],
    description: "Bearing the bloodline of an infernal legacy, proud and mystically potent.",
    portraitDescriptor: "tiefling adventurer with sweeping curved ram horns, dusky reddish-purple skin, solid glowing ember irises",
  },
  dragonborn: {
    id: "dragonborn",
    name: "Dragonborn",
    speed: 30,
    size: "Medium",
    abilityScoreIncreases: { str: 2, cha: 1 },
    traits: [
      { name: "Draconic Ancestry", description: "Breath weapon and elemental resistance corresponding to your dragon ancestor." }
    ],
    description: "Born of dragons, walking proudly through a world that greets them with awe.",
    portraitDescriptor: "dragonborn adventurer with shimmering scales, reptilian snout, horned crest, sharp slit golden eyes",
  },
  half_orc: {
    id: "half_orc",
    name: "Half-Orc",
    speed: 30,
    size: "Medium",
    abilityScoreIncreases: { str: 2, con: 1 },
    traits: [
      { name: "Relentless Endurance", description: "When reduced to 0 HP but not killed outright, drop to 1 HP instead once per long rest." },
      { name: "Savage Attacks", description: "Roll one additional weapon damage die when scoring a critical hit." }
    ],
    description: "Fierce combatants carrying the boundless spirit of human tenacity and orcish fortitude.",
    portraitDescriptor: "half-orc adventurer with heavy jaw, protruding lower canine tusks, battle scars, olive-green skin",
  },
};
