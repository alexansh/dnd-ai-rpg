import { AbilityScoreKey, DamageType, Condition } from "../srd/types";
import { executeRoll, RollResult, rollAdvantage, rollDisadvantage, rollStandard } from "./dice";

export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function calculateProficiencyBonus(level: number): number {
  return Math.floor((Math.max(1, level) - 1) / 4) + 2;
}

export interface CheckOutcome {
  rollResult: RollResult;
  targetDC: number;
  isSuccess: boolean;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  margin: number;
  breakdown: string;
}

export function resolveSkillCheck(params: {
  abilityScore: number;
  isProficient?: boolean;
  proficiencyBonus?: number;
  additionalBonus?: number;
  dc: number;
  advantage?: "advantage" | "disadvantage" | "normal";
  skillName?: string;
}): CheckOutcome {
  const abilityMod = calculateAbilityModifier(params.abilityScore);
  const profMod = params.isProficient ? (params.proficiencyBonus ?? 2) : 0;
  const totalMod = abilityMod + profMod + (params.additionalBonus ?? 0);

  let roll: RollResult;
  if (params.advantage === "advantage") {
    roll = rollAdvantage(totalMod, params.skillName);
  } else if (params.advantage === "disadvantage") {
    roll = rollDisadvantage(totalMod, params.skillName);
  } else {
    roll = rollStandard(totalMod, params.skillName);
  }

  const isCriticalSuccess = roll.isNat20;
  const isCriticalFailure = roll.isNat1;
  const isSuccess = isCriticalSuccess || (!isCriticalFailure && roll.total >= params.dc);
  const margin = roll.total - params.dc;

  const sign = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
  const breakdown = `Roll (${roll.explanation}) vs DC ${params.dc} ➔ ${
    isCriticalSuccess
      ? "CRITICAL SUCCESS!"
      : isCriticalFailure
      ? "CRITICAL FAILURE!"
      : isSuccess
      ? "SUCCESS"
      : "FAILURE"
  }`;

  return {
    rollResult: roll,
    targetDC: params.dc,
    isSuccess,
    isCriticalSuccess,
    isCriticalFailure,
    margin,
    breakdown,
  };
}

export interface AttackOutcome {
  attackRoll: RollResult;
  targetAC: number;
  isHit: boolean;
  isCritical: boolean;
  isFumble: boolean;
  breakdown: string;
}

export function resolveAttackRoll(params: {
  attackBonus: number;
  targetAC: number;
  coverBonus?: number;
  advantage?: "advantage" | "disadvantage" | "normal";
  attackerName?: string;
  targetName?: string;
}): AttackOutcome {
  const effectiveAC = params.targetAC + (params.coverBonus ?? 0);

  let roll: RollResult;
  if (params.advantage === "advantage") {
    roll = rollAdvantage(params.attackBonus, `${params.attackerName ?? "Attacker"} Strikes`);
  } else if (params.advantage === "disadvantage") {
    roll = rollDisadvantage(params.attackBonus, `${params.attackerName ?? "Attacker"} Strikes`);
  } else {
    roll = rollStandard(params.attackBonus, `${params.attackerName ?? "Attacker"} Strikes`);
  }

  const isCritical = roll.isNat20;
  const isFumble = roll.isNat1;
  const isHit = isCritical || (!isFumble && roll.total >= effectiveAC);

  const breakdown = `${params.attackerName ?? "Attacker"} vs AC ${effectiveAC}: ${roll.explanation} ➔ ${
    isCritical ? "CRITICAL HIT!" : isFumble ? "CRITICAL MISS!" : isHit ? "HIT" : "MISS"
  }`;

  return {
    attackRoll: roll,
    targetAC: effectiveAC,
    isHit,
    isCritical,
    isFumble,
    breakdown,
  };
}

export interface DamageOutcome {
  rollResult: RollResult;
  rawDamage: number;
  effectiveDamage: number;
  damageType: DamageType;
  multiplier: number; // 0 for immune, 0.5 for resistant, 2 for vulnerable, 1 for normal
  breakdown: string;
}

export function resolveDamage(params: {
  damageDice: string;
  damageType: DamageType;
  isCritical?: boolean;
  resistances?: DamageType[];
  immunities?: DamageType[];
  vulnerabilities?: DamageType[];
}): DamageOutcome {
  // If critical, double the dice count (e.g. 1d8 -> 2d8, 2d6 -> 4d6)
  let diceNotation = params.damageDice;
  if (params.isCritical) {
    const match = diceNotation.match(/^(\d*)d(\d+)(.*)$/);
    if (match) {
      const count = match[1] ? parseInt(match[1], 10) : 1;
      diceNotation = `${count * 2}d${match[2]}${match[3]}`;
    }
  }

  const roll = executeRoll(diceNotation, `${params.damageType} damage`);
  const rawDamage = Math.max(1, roll.total);

  let multiplier = 1;
  if (params.immunities?.includes(params.damageType)) {
    multiplier = 0;
  } else if (params.resistances?.includes(params.damageType)) {
    multiplier = 0.5;
  } else if (params.vulnerabilities?.includes(params.damageType)) {
    multiplier = 2;
  }

  const effectiveDamage = Math.floor(rawDamage * multiplier);
  const modifierText =
    multiplier === 0
      ? " (IMMUNE: 0 dmg)"
      : multiplier === 0.5
      ? " (RESISTANT: half dmg)"
      : multiplier === 2
      ? " (VULNERABLE: double dmg)"
      : "";

  const breakdown = `${roll.explanation} ${params.damageType} damage${modifierText} ➔ ${effectiveDamage} HP lost`;

  return {
    rollResult: roll,
    rawDamage,
    effectiveDamage,
    damageType: params.damageType,
    multiplier,
    breakdown,
  };
}

export interface DeathSaveState {
  successes: number;
  failures: number;
  isStabilized: boolean;
  isDead: boolean;
  history: string[];
}

export function resolveDeathSavingThrow(currentState: DeathSaveState): {
  rollResult: RollResult;
  newState: DeathSaveState;
  announcement: string;
} {
  const roll = executeRoll("1d20", "Death Saving Throw");
  const newState: DeathSaveState = { ...currentState, history: [...currentState.history] };

  let announcement = "";
  if (roll.isNat20) {
    newState.isStabilized = true;
    announcement = "Natural 20! You regain consciousness with 1 HP!";
    newState.history.push("Nat 20: Restored 1 HP");
  } else if (roll.isNat1) {
    newState.failures = Math.min(3, newState.failures + 2);
    announcement = "Critical Fumble (Nat 1)! Marked TWO death save failures!";
    newState.history.push("Nat 1: 2 Failures");
  } else if (roll.total >= 10) {
    newState.successes = Math.min(3, newState.successes + 1);
    announcement = `Success (${roll.total} >= 10). [${newState.successes}/3]`;
    newState.history.push(`Success (${roll.total})`);
  } else {
    newState.failures = Math.min(3, newState.failures + 1);
    announcement = `Failure (${roll.total} < 10). [${newState.failures}/3]`;
    newState.history.push(`Failure (${roll.total})`);
  }

  if (newState.successes >= 3) {
    newState.isStabilized = true;
    announcement += " Stabilized at 0 HP!";
  } else if (newState.failures >= 3) {
    newState.isDead = true;
    announcement += " Your soul has passed into the Shadowfell.";
  }

  return { rollResult: roll, newState, announcement };
}
