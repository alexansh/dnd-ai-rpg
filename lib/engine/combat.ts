import { Condition } from "../srd/types";
import { executeRoll } from "./dice";

export interface Combatant {
  id: string;
  name: string;
  isPlayer: boolean;
  isCompanion: boolean;
  isEnemy: boolean;
  armorClass: number;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  speed: number;
  initiative: number;
  initiativeModifier: number;
  conditions: Condition[];
  gridPosition: { x: number; y: number };
  portrait: string;
  // Turn action economy
  actionUsed: boolean;
  bonusActionUsed: boolean;
  reactionUsed: boolean;
  movementUsedFt: number;
  weaponAttackBonus: number;
  weaponDamageDice: string;
  weaponDamageType: any;
  spellSlotsLevel1?: number;
  maxSpellSlotsLevel1?: number;
}

export interface CombatState {
  isActive: boolean;
  round: number;
  activeTurnIndex: number;
  combatants: Combatant[];
  log: string[];
}

export function rollInitiative(modifier: number): number {
  const roll = executeRoll(`1d20+${modifier}`, "Initiative");
  return roll.total;
}

export function initializeCombat(combatants: Omit<Combatant, "initiative" | "actionUsed" | "bonusActionUsed" | "reactionUsed" | "movementUsedFt">[]): CombatState {
  const initialized: Combatant[] = combatants.map((c) => ({
    ...c,
    initiative: rollInitiative(c.initiativeModifier),
    actionUsed: false,
    bonusActionUsed: false,
    reactionUsed: false,
    movementUsedFt: 0,
  }));

  // Sort descending by initiative score
  initialized.sort((a, b) => b.initiative - a.initiative);

  const activeTurnName = initialized[0]?.name ?? "Unknown";

  return {
    isActive: true,
    round: 1,
    activeTurnIndex: 0,
    combatants: initialized,
    log: [
      "⚔️ Combat Begins!",
      `Initiative order: ${initialized.map((c) => `${c.name} (${c.initiative})`).join(" ➔ ")}`,
      `Round 1 begins. ${activeTurnName}'s turn.`,
    ],
  };
}

export function advanceTurn(state: CombatState): CombatState {
  if (!state.isActive || state.combatants.length === 0) return state;

  let nextIndex = state.activeTurnIndex + 1;
  let nextRound = state.round;

  if (nextIndex >= state.combatants.length) {
    nextIndex = 0;
    nextRound += 1;
  }

  // Reset action economy for the new active combatant
  const updatedCombatants = state.combatants.map((c, i) => {
    if (i === nextIndex) {
      return {
        ...c,
        actionUsed: false,
        bonusActionUsed: false,
        reactionUsed: false,
        movementUsedFt: 0,
      };
    }
    return c;
  });

  const nextCombatant = updatedCombatants[nextIndex];
  const newLog = [...state.log];
  if (nextRound > state.round) {
    newLog.push(`--- Round ${nextRound} ---`);
  }
  newLog.push(`It is now ${nextCombatant.name}'s turn.`);

  return {
    ...state,
    round: nextRound,
    activeTurnIndex: nextIndex,
    combatants: updatedCombatants,
    log: newLog,
  };
}

export function applyDamageToCombatant(combatant: Combatant, damage: number): {
  combatant: Combatant;
  died: boolean;
  knockedOut: boolean;
} {
  let hpLoss = damage;
  let newTempHp = combatant.tempHp;

  // Absorb with temp HP first
  if (newTempHp > 0) {
    if (newTempHp >= hpLoss) {
      newTempHp -= hpLoss;
      hpLoss = 0;
    } else {
      hpLoss -= newTempHp;
      newTempHp = 0;
    }
  }

  const newHp = Math.max(0, combatant.currentHp - hpLoss);
  let died = false;
  let knockedOut = false;
  const newConditions = [...combatant.conditions];

  if (newHp === 0 && combatant.currentHp > 0) {
    if (combatant.isEnemy) {
      died = true;
      newConditions.push("dead");
    } else {
      knockedOut = true;
      newConditions.push("unconscious");
      newConditions.push("prone");
    }
  }

  return {
    combatant: {
      ...combatant,
      currentHp: newHp,
      tempHp: newTempHp,
      conditions: Array.from(new Set(newConditions)),
    },
    died,
    knockedOut,
  };
}
