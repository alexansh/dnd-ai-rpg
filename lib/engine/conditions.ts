import { AbilityScoreKey } from "../srd/types";

export type SRDConditionKey =
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
  | "exhaustion";

export interface ConditionDefinition {
  name: string;
  description: string;
  grantsAdvantageAgainstMelee?: boolean;
  grantsAdvantageAgainstRanged?: boolean;
  grantsDisadvantageAgainst?: boolean;
  imposesAttackDisadvantage?: boolean;
  imposesAbilityCheckDisadvantage?: boolean;
  autoFailsStrSaves?: boolean;
  autoFailsDexSaves?: boolean;
  isIncapped?: boolean;
  setsSpeedZero?: boolean;
  meleeHitIsAutoCrit?: boolean;
}

export const SRD_CONDITIONS: Record<SRDConditionKey, ConditionDefinition> = {
  blinded: {
    name: "Blinded",
    description: "Cannot see; auto-fails sight checks; attacks have disadvantage; attacks against have advantage.",
    grantsAdvantageAgainstMelee: true,
    grantsAdvantageAgainstRanged: true,
    imposesAttackDisadvantage: true,
    imposesAbilityCheckDisadvantage: true,
  },
  charmed: {
    name: "Charmed",
    description: "Cannot harm the charmer; charmer has advantage on social ability checks against you.",
  },
  deafened: {
    name: "Deafened",
    description: "Cannot hear; auto-fails ability checks that require hearing.",
    imposesAbilityCheckDisadvantage: true,
  },
  frightened: {
    name: "Frightened",
    description: "Disadvantage on ability checks and attack rolls while source of fear is in line of sight; cannot willingly move closer.",
    imposesAttackDisadvantage: true,
    imposesAbilityCheckDisadvantage: true,
  },
  grappled: {
    name: "Grappled",
    description: "Speed becomes 0 and cannot benefit from any bonus to speed.",
    setsSpeedZero: true,
  },
  incapacitated: {
    name: "Incapacitated",
    description: "Cannot take actions or reactions.",
    isIncapped: true,
  },
  invisible: {
    name: "Invisible",
    description: "Impossible to see without aid; attack rolls have advantage; attacks against have disadvantage.",
    grantsDisadvantageAgainst: true,
  },
  paralyzed: {
    name: "Paralyzed",
    description: "Incapacitated, speed 0; auto-fails STR and DEX saves; attacks against have advantage; attacks within 5ft are crits.",
    isIncapped: true,
    setsSpeedZero: true,
    autoFailsStrSaves: true,
    autoFailsDexSaves: true,
    grantsAdvantageAgainstMelee: true,
    grantsAdvantageAgainstRanged: true,
    meleeHitIsAutoCrit: true,
  },
  petrified: {
    name: "Petrified",
    description: "Transformed into stone; incapacitated, speed 0; resistant to all damage; auto-fails STR and DEX saves.",
    isIncapped: true,
    setsSpeedZero: true,
    autoFailsStrSaves: true,
    autoFailsDexSaves: true,
  },
  poisoned: {
    name: "Poisoned",
    description: "Disadvantage on attack rolls and ability checks.",
    imposesAttackDisadvantage: true,
    imposesAbilityCheckDisadvantage: true,
  },
  prone: {
    name: "Prone",
    description: "Crawling only; attacks have disadvantage; melee attacks against within 5ft have advantage; ranged have disadvantage.",
    imposesAttackDisadvantage: true,
    grantsAdvantageAgainstMelee: true,
    grantsDisadvantageAgainst: true, // for ranged
  },
  restrained: {
    name: "Restrained",
    description: "Speed becomes 0; attacks against have advantage; attacks have disadvantage; disadvantage on DEX saves.",
    setsSpeedZero: true,
    imposesAttackDisadvantage: true,
    grantsAdvantageAgainstMelee: true,
    grantsAdvantageAgainstRanged: true,
  },
  stunned: {
    name: "Stunned",
    description: "Incapacitated, speed 0; falters in speech; auto-fails STR and DEX saves; attacks against have advantage.",
    isIncapped: true,
    setsSpeedZero: true,
    autoFailsStrSaves: true,
    autoFailsDexSaves: true,
    grantsAdvantageAgainstMelee: true,
    grantsAdvantageAgainstRanged: true,
  },
  unconscious: {
    name: "Unconscious",
    description: "Incapacitated, drops held items, prone; auto-fails STR and DEX saves; attacks against have advantage; hits within 5ft are crits.",
    isIncapped: true,
    setsSpeedZero: true,
    autoFailsStrSaves: true,
    autoFailsDexSaves: true,
    grantsAdvantageAgainstMelee: true,
    grantsAdvantageAgainstRanged: true,
    meleeHitIsAutoCrit: true,
  },
  exhaustion: {
    name: "Exhaustion",
    description: "Level 1: Disadvantage on ability checks. Level 2: Speed halved. Level 3: Disadvantage on attacks and saves.",
    imposesAbilityCheckDisadvantage: true,
  },
};

export interface ActiveCondition {
  id: string;
  condition: SRDConditionKey;
  source: string;
  roundsRemaining?: number; // if undefined, lasts until cured or save succeeds
  saveType?: AbilityScoreKey;
  saveDc?: number;
}

export function tickConditions(conditions: ActiveCondition[]): {
  active: ActiveCondition[];
  expired: ActiveCondition[];
} {
  const active: ActiveCondition[] = [];
  const expired: ActiveCondition[] = [];

  for (const cond of conditions) {
    if (cond.roundsRemaining !== undefined) {
      const nextRounds = cond.roundsRemaining - 1;
      if (nextRounds <= 0) {
        expired.push(cond);
      } else {
        active.push({ ...cond, roundsRemaining: nextRounds });
      }
    } else {
      active.push(cond);
    }
  }

  return { active, expired };
}

export interface ConditionModifiers {
  hasAttackAdvantage: boolean;
  hasAttackDisadvantage: boolean;
  hasAbilityCheckDisadvantage: boolean;
  isSpeedZero: boolean;
  isIncapacitated: boolean;
  meleeAttackersHaveAdvantage: boolean;
  rangedAttackersHaveAdvantage: boolean;
  rangedAttackersHaveDisadvantage: boolean;
  autoFailsStrSaves: boolean;
  autoFailsDexSaves: boolean;
  meleeHitIsAutoCrit: boolean;
}

export function getConditionModifiers(conditions: ActiveCondition[]): ConditionModifiers {
  const mods: ConditionModifiers = {
    hasAttackAdvantage: false,
    hasAttackDisadvantage: false,
    hasAbilityCheckDisadvantage: false,
    isSpeedZero: false,
    isIncapacitated: false,
    meleeAttackersHaveAdvantage: false,
    rangedAttackersHaveAdvantage: false,
    rangedAttackersHaveDisadvantage: false,
    autoFailsStrSaves: false,
    autoFailsDexSaves: false,
    meleeHitIsAutoCrit: false,
  };

  for (const cond of conditions) {
    const def = SRD_CONDITIONS[cond.condition];
    if (!def) continue;

    if (cond.condition === "invisible") mods.hasAttackAdvantage = true;
    if (def.imposesAttackDisadvantage) mods.hasAttackDisadvantage = true;
    if (def.imposesAbilityCheckDisadvantage) mods.hasAbilityCheckDisadvantage = true;
    if (def.setsSpeedZero) mods.isSpeedZero = true;
    if (def.isIncapped) mods.isIncapacitated = true;
    if (def.grantsAdvantageAgainstMelee) mods.meleeAttackersHaveAdvantage = true;
    if (def.grantsAdvantageAgainstRanged) mods.rangedAttackersHaveAdvantage = true;
    if (cond.condition === "prone") mods.rangedAttackersHaveDisadvantage = true;
    if (def.autoFailsStrSaves) mods.autoFailsStrSaves = true;
    if (def.autoFailsDexSaves) mods.autoFailsDexSaves = true;
    if (def.meleeHitIsAutoCrit) mods.meleeHitIsAutoCrit = true;
  }

  return mods;
}
