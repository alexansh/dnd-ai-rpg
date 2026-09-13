import { Combatant } from "../engine/combat";
import { isWithinRange, calculateDistanceFt } from "../engine/tactical";

export interface CompanionProfile {
  id: string;
  name: string;
  className: string;
  role: string;
  alignment: string;
  personality: string;
  tacticalStyle: string;
  approval: number; // -100 to 100
  portrait: string;
}

export const COMPANION_PROFILES: Record<string, CompanionProfile> = {
  beatrice: {
    id: "beatrice",
    name: "Sister Beatrice",
    className: "Cleric",
    role: "Devout Life Healer",
    alignment: "Neutral Good",
    personality: "Pragmatic, compassionate, unwavering faith in the Dawnmother, despises reckless cruelty.",
    tacticalStyle: "Prioritizes healing grievously wounded allies, smites undead with radiant fire.",
    approval: 20,
    portrait: "/assets/images/companions/thalia.jpg",
  },
  vaelin: {
    id: "vaelin",
    name: "Vaelin Shadowstep",
    className: "Rogue",
    role: "Infiltrator & Scout",
    alignment: "Chaotic Neutral",
    personality: "Cynical, sharp-tongued, opportunistic, hyper-observant of traps and coin purses.",
    tacticalStyle: "Hunts flanking angles for Sneak Attacks, retreats behind cover with Cunning Action.",
    approval: 10,
    portrait: "/assets/images/companions/vaelin.jpg",
  },
  garrick: {
    id: "garrick",
    name: "Garrick Stonefist",
    className: "Fighter",
    role: "Vanguard Defender",
    alignment: "Lawful Good",
    personality: "Stoic, honorable, proud veteran of the Silver Guard, protective of his companions.",
    tacticalStyle: "Holds chokepoints, taunts deadly foes, swings forged steel with crushing force.",
    approval: 25,
    portrait: "/assets/images/companions/grimjaw.jpg",
  },
};

export interface CompanionTacticalDecision {
  actionType: "attack" | "cast_spell" | "dash" | "dodge" | "end_turn";
  targetId?: string;
  spellId?: string;
  narrativeCallout: string;
  newPosition?: { x: number; y: number };
}

export function decideCompanionCombatTurn(
  companion: Combatant,
  allCombatants: Combatant[]
): CompanionTacticalDecision {
  const enemies = allCombatants.filter((c) => c.isEnemy && c.currentHp > 0);
  const allies = allCombatants.filter((c) => !c.isEnemy && c.currentHp > 0);

  if (enemies.length === 0) {
    return {
      actionType: "end_turn",
      narrativeCallout: `${companion.name} lowers their weapon. The area is clear.`,
    };
  }

  // 1. Cleric AI (Sister Beatrice)
  if (companion.id === "beatrice") {
    // Check if any ally is below 50% HP
    const woundedAlly = allies.find((a) => a.currentHp <= a.maxHp * 0.5);
    if (woundedAlly && (companion.spellSlotsLevel1 ?? 1) > 0) {
      return {
        actionType: "cast_spell",
        spellId: "cure_wounds",
        targetId: woundedAlly.id,
        narrativeCallout: `${companion.name} lays a glowing hand upon ${woundedAlly.name}, invoking the Dawnmother's restorative light!`,
      };
    }

    // Otherwise, target closest enemy with Sacred Flame
    const nearestEnemy = [...enemies].sort(
      (a, b) =>
        calculateDistanceFt(companion.gridPosition, a.gridPosition) -
        calculateDistanceFt(companion.gridPosition, b.gridPosition)
    )[0];

    return {
      actionType: "cast_spell",
      spellId: "sacred_flame",
      targetId: nearestEnemy.id,
      narrativeCallout: `${companion.name} calls down a pillar of golden celestial fire upon ${nearestEnemy.name}!`,
    };
  }

  // 2. Rogue AI (Vaelin Shadowstep)
  if (companion.id === "vaelin") {
    // Prioritize enemy already engaged with an ally (Sneak Attack condition)
    const engagedEnemy = enemies.find((e) =>
      allies.some((a) => a.id !== companion.id && isWithinRange(a.gridPosition, e.gridPosition, 5))
    );
    const target = engagedEnemy ?? enemies[0];

    return {
      actionType: "attack",
      targetId: target.id,
      narrativeCallout: `${companion.name} darts from the shadows, seeking a vital seam in ${target.name}'s defense!`,
    };
  }

  // 3. Fighter AI (Garrick Stonefist)
  const targetEnemy = [...enemies].sort(
    (a, b) =>
      calculateDistanceFt(companion.gridPosition, a.gridPosition) -
      calculateDistanceFt(companion.gridPosition, b.gridPosition)
  )[0];

  return {
    actionType: "attack",
    targetId: targetEnemy.id,
    narrativeCallout: `${companion.name} roars a battle cry and delivers a heavy strike at ${targetEnemy.name}!`,
  };
}