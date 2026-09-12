export type AbilityScoreKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export type DamageType =
  | "slashing"
  | "piercing"
  | "bludgeoning"
  | "fire"
  | "cold"
  | "lightning"
  | "thunder"
  | "poison"
  | "acid"
  | "radiant"
  | "necrotic"
  | "force"
  | "psychic";

export type Condition =
  | "blinded"
  | "charmed"
  | "deafened"
  | "frightened"
  | "grappled"
  | "incapacitated"
  | "invisible"
  | "paralyzed"
  | "petrified"
  | "poisoned"
  | "prone"
  | "restrained"
  | "stunned"
  | "unconscious"
  | "dead";

export interface MonsterAction {
  name: string;
  type: "melee" | "ranged" | "spell" | "special";
  toHit: number;
  reachOrRange: string;
  target: string;
  damageDice: string;
  damageType: DamageType;
  description: string;
}

export interface MonsterStatblock {
  id: string;
  name: string;
  size: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
  type: string;
  alignment: string;
  armorClass: number;
  armorType: string;
  hitPoints: number;
  hitDice: string;
  speed: number;
  abilities: AbilityScores;
  savingThrows?: Partial<Record<AbilityScoreKey, number>>;
  skills?: Record<string, number>;
  damageResistances?: DamageType[];
  damageImmunities?: DamageType[];
  conditionImmunities?: Condition[];
  senses: string;
  languages: string;
  challengeRating: number;
  experiencePoints: number;
  actions: MonsterAction[];
  specialTraits?: { name: string; description: string }[];
  portrait?: string;
}

export interface SpellDefinition {
  id: string;
  name: string;
  level: number;
  school: "Evocation" | "Abjuration" | "Necromancy" | "Conjuration" | "Enchantment" | "Divination" | "Illusion" | "Transmutation";
  castingTime: "1 action" | "1 bonus action" | "1 reaction";
  range: string;
  rangeFt: number;
  components: string;
  duration: string;
  classes: string[];
  description: string;
  damageDice?: string;
  damageType?: DamageType;
  healingDice?: string;
  savingThrow?: AbilityScoreKey;
  isConcentration?: boolean;
}

export interface ItemDefinition {
  id: string;
  name: string;
  category: "weapon" | "armor" | "shield" | "potion" | "gear";
  rarity: "common" | "uncommon" | "rare" | "very rare";
  cost: string;
  weightLbs: number;
  description: string;
  damageDice?: string;
  damageType?: DamageType;
  weaponRange?: "melee" | "ranged";
  properties?: string[];
  armorClassBonus?: number;
  baseArmorClass?: number;
  stealthDisadvantage?: boolean;
  healingDice?: string;
}

export interface CharacterClassDefinition {
  id: string;
  name: string;
  hitDie: number;
  primaryAbilities: AbilityScoreKey[];
  savingThrowProficiencies: AbilityScoreKey[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  spellcastingAbility?: AbilityScoreKey;
  description: string;
  defaultStartingGear: string[];
}

export interface CharacterRaceDefinition {
  id: string;
  name: string;
  speed: number;
  size: "Small" | "Medium";
  abilityScoreIncreases: Partial<Record<AbilityScoreKey, number>>;
  traits: { name: string; description: string }[];
  description: string;
  portraitDescriptor: string;
}
