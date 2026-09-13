import { calculateAbilityModifier } from "./rules";
import { executeRoll, RollResult, rollAdvantage, rollDisadvantage, rollStandard } from "./dice";
import { AdvantageMode } from "./types";

export interface ConcentrationCheckOutcome {
  dc: number;
  rollResult: RollResult;
  isMaintained: boolean;
  breakdown: string;
}

export function calculateConcentrationDc(damageTaken: number): number {
  return Math.max(10, Math.floor(damageTaken / 2));
}

export function resolveConcentrationCheck(params: {
  conScore: number;
  damageTaken: number;
  isProficient?: boolean;
  proficiencyBonus?: number;
  advantage?: AdvantageMode;
}): ConcentrationCheckOutcome {
  const dc = calculateConcentrationDc(params.damageTaken);
  const conMod = calculateAbilityModifier(params.conScore);
  const profMod = params.isProficient ? (params.proficiencyBonus ?? 2) : 0;
  const totalMod = conMod + profMod;

  let roll: RollResult;
  if (params.advantage === "adv") {
    roll = rollAdvantage(totalMod, "Concentration CON Save");
  } else if (params.advantage === "dis") {
    roll = rollDisadvantage(totalMod, "Concentration CON Save");
  } else {
    roll = rollStandard(totalMod, "Concentration CON Save");
  }

  const isMaintained = roll.isNat20 || (!roll.isNat1 && roll.total >= dc);

  const breakdown = `Concentration Save (DC ${dc} from ${params.damageTaken} damage): Rolled ${roll.explanation} ➔ ${
    isMaintained ? "MAINTAINED" : "BROKEN"
  }`;

  return {
    dc,
    rollResult: roll,
    isMaintained,
    breakdown,
  };
}
