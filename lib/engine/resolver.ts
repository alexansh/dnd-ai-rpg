import { EngineRequest, EngineResult } from "./types";
import {
  calculateAbilityModifier,
  calculateProficiencyBonus,
  resolveSkillCheck,
  resolveAttackRoll,
  resolveDamage,
  resolveDeathSavingThrow,
} from "./rules";
import { resolveConcentrationCheck } from "./concentration";
import { executeRoll, rollAdvantage, rollDisadvantage, rollStandard } from "./dice";

export function resolveEngineRequest(request: EngineRequest): EngineResult {
  const timestamp = new Date().toISOString();

  switch (request.type) {
    case "ability_check": {
      const abilityScore = request.abilityScore ?? 10;
      const profBonus = request.proficiencyBonus ?? 2;
      const advParam = request.advantage === "adv" ? "advantage" : request.advantage === "dis" ? "disadvantage" : "normal";

      const outcome = resolveSkillCheck({
        abilityScore,
        isProficient: request.isProficient,
        proficiencyBonus: profBonus,
        dc: request.dc,
        advantage: advParam,
        skillName: request.skill,
      });

      return {
        request,
        rolls: outcome.rollResult.rolls.map((r) => r.value),
        total: outcome.rollResult.total,
        success: outcome.isSuccess,
        isCrit: outcome.isCriticalSuccess,
        isFumble: outcome.isCriticalFailure,
        breakdown: outcome.breakdown,
        detail: {
          margin: outcome.margin,
          targetDC: outcome.targetDC,
          explanation: outcome.rollResult.explanation,
        },
        timestamp,
      };
    }

    case "saving_throw": {
      const abilityScore = request.abilityScore ?? 10;
      const profBonus = request.proficiencyBonus ?? 2;
      const advParam = request.advantage === "adv" ? "advantage" : request.advantage === "dis" ? "disadvantage" : "normal";

      const outcome = resolveSkillCheck({
        abilityScore,
        isProficient: request.isProficient,
        proficiencyBonus: profBonus,
        dc: request.dc,
        advantage: advParam,
        skillName: `${request.ability.toUpperCase()} Save`,
      });

      return {
        request,
        rolls: outcome.rollResult.rolls.map((r) => r.value),
        total: outcome.rollResult.total,
        success: outcome.isSuccess,
        isCrit: outcome.isCriticalSuccess,
        isFumble: outcome.isCriticalFailure,
        breakdown: `${request.ability.toUpperCase()} Save vs DC ${request.dc}: ${outcome.rollResult.explanation} ➔ ${
          outcome.isSuccess ? "SUCCESS" : "FAILURE"
        }`,
        detail: {
          margin: outcome.margin,
          targetDC: outcome.targetDC,
        },
        timestamp,
      };
    }

    case "attack_roll": {
      const advParam = request.advantage === "adv" ? "advantage" : request.advantage === "dis" ? "disadvantage" : "normal";
      const outcome = resolveAttackRoll({
        attackBonus: request.attackBonus,
        targetAC: request.targetAc,
        coverBonus: request.coverBonus ?? 0,
        advantage: advParam,
      });

      return {
        request,
        rolls: outcome.attackRoll.rolls.map((r) => r.value),
        total: outcome.attackRoll.total,
        success: outcome.isHit,
        isCrit: outcome.isCritical,
        isFumble: outcome.isFumble,
        breakdown: outcome.breakdown,
        detail: {
          effectiveAC: outcome.targetAC,
          isHit: outcome.isHit,
        },
        timestamp,
      };
    }

    case "damage_roll": {
      const outcome = resolveDamage({
        damageDice: request.formula,
        damageType: request.damageType,
        isCritical: request.isCrit,
        resistances: request.resistances,
        vulnerabilities: request.vulnerabilities,
        immunities: request.immunities,
      });

      return {
        request,
        rolls: outcome.rollResult.rolls.map((r) => r.value),
        total: outcome.effectiveDamage,
        success: outcome.effectiveDamage > 0,
        isCrit: request.isCrit,
        breakdown: outcome.breakdown,
        detail: {
          rawDamage: outcome.rawDamage,
          effectiveDamage: outcome.effectiveDamage,
          multiplier: outcome.multiplier,
        },
        timestamp,
      };
    }

    case "death_save": {
      const outcome = resolveDeathSavingThrow({
        successes: 0,
        failures: 0,
        isStabilized: false,
        isDead: false,
        history: [],
      });

      const roll = outcome.rollResult;
      const isCrit = roll.isNat20;
      const isFumble = roll.isNat1;
      const success = isCrit || (!isFumble && roll.total >= 10);

      return {
        request,
        rolls: roll.rolls.map((r) => r.value),
        total: roll.total,
        success,
        isCrit,
        isFumble,
        breakdown: outcome.announcement,
        detail: {
          isStabilized: outcome.newState.isStabilized,
          isDead: outcome.newState.isDead,
          successes: outcome.newState.successes,
          failures: outcome.newState.failures,
        },
        timestamp,
      };
    }

    case "concentration_check": {
      const outcome = resolveConcentrationCheck({
        conScore: request.conScore,
        damageTaken: request.damageTaken,
        isProficient: request.isProficient,
        proficiencyBonus: request.proficiencyBonus,
        advantage: request.advantage,
      });

      return {
        request,
        rolls: outcome.rollResult.rolls.map((r) => r.value),
        total: outcome.rollResult.total,
        success: outcome.isMaintained,
        isCrit: outcome.rollResult.isNat20,
        isFumble: outcome.rollResult.isNat1,
        breakdown: outcome.breakdown,
        detail: {
          dc: outcome.dc,
          isMaintained: outcome.isMaintained,
        },
        timestamp,
      };
    }
  }
}
