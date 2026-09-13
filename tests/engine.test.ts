import test from "node:test";
import assert from "node:assert";
import { parseDiceNotation, executeRoll } from "../lib/engine/dice";
import {
  calculateAbilityModifier,
  calculateProficiencyBonus,
  resolveSkillCheck,
  resolveAttackRoll,
  resolveDamage,
  resolveDeathSavingThrow,
} from "../lib/engine/rules";
import { calculateDistanceFt, hasLineOfSight, getCoverBonus, TacticalNode } from "../lib/engine/tactical";
import { initializeCombat, advanceTurn, applyDamageToCombatant } from "../lib/engine/combat";

test("Dice Parser & Roll Engine", async (t) => {
  await t.test("parses standard notation and calculates totals", () => {
    const p1 = parseDiceNotation("1d20+4");
    assert.strictEqual(p1.count, 1);
    assert.strictEqual(p1.sides, 20);
    assert.strictEqual(p1.modifier, 4);

    const p2 = parseDiceNotation("2d6-1");
    assert.strictEqual(p2.count, 2);
    assert.strictEqual(p2.sides, 6);
    assert.strictEqual(p2.modifier, -1);

    const p3 = parseDiceNotation("2d20kh1+5");
    assert.strictEqual(p3.count, 2);
    assert.strictEqual(p3.keepHighest, 1);
    assert.strictEqual(p3.modifier, 5);

    const res = executeRoll("3d6+2");
    assert.ok(res.total >= 5 && res.total <= 20);
    assert.strictEqual(res.rolls.length, 3);
  });
});

test("5e Rules Math & Determinisim", async (t) => {
  await t.test("ability modifiers follow 5e formula", () => {
    assert.strictEqual(calculateAbilityModifier(10), 0);
    assert.strictEqual(calculateAbilityModifier(11), 0);
    assert.strictEqual(calculateAbilityModifier(12), 1);
    assert.strictEqual(calculateAbilityModifier(18), 4);
    assert.strictEqual(calculateAbilityModifier(8), -1);
    assert.strictEqual(calculateAbilityModifier(6), -2);
  });

  await t.test("proficiency bonus tiers", () => {
    assert.strictEqual(calculateProficiencyBonus(1), 2);
    assert.strictEqual(calculateProficiencyBonus(4), 2);
    assert.strictEqual(calculateProficiencyBonus(5), 3);
    assert.strictEqual(calculateProficiencyBonus(9), 4);
  });

  await t.test("skill checks evaluate target DC", () => {
    const outcome = resolveSkillCheck({
      abilityScore: 16, // +3
      isProficient: true,
      proficiencyBonus: 2, // total mod +5
      dc: 15,
      skillName: "Athletics",
    });
    assert.strictEqual(typeof outcome.isSuccess, "boolean");
    assert.strictEqual(outcome.targetDC, 15);
  });

  await t.test("damage resolution applies resistances and immunities", () => {
    // Normal damage
    const normal = resolveDamage({
      damageDice: "1d8+2",
      damageType: "slashing",
    });
    assert.strictEqual(normal.multiplier, 1);

    // Resistance
    const resistant = resolveDamage({
      damageDice: "2d6",
      damageType: "fire",
      resistances: ["fire"],
    });
    assert.strictEqual(resistant.multiplier, 0.5);

    // Immunity
    const immune = resolveDamage({
      damageDice: "3d6",
      damageType: "poison",
      immunities: ["poison"],
    });
    assert.strictEqual(immune.multiplier, 0);
    assert.strictEqual(immune.effectiveDamage, 0);
  });
});

test("Tactical Grid & Combat Mechanics", async (t) => {
  await t.test("Chebyshev 5ft grid distance calculation", () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 }; // dx=3, dy=4 -> max(3,4)*5 = 20 ft
    assert.strictEqual(calculateDistanceFt(p1, p2), 20);
  });

  await t.test("Line of sight and cover detection", () => {
    const grid: Record<string, TacticalNode> = {
      "2,2": { x: 2, y: 2, terrain: "pillar", providesCover: "half", isDifficultTerrain: false },
    };
    const los = hasLineOfSight({ x: 0, y: 0 }, { x: 4, y: 4 }, grid);
    assert.strictEqual(los.hasLOS, true);
    assert.strictEqual(los.cover, "half");
    assert.strictEqual(getCoverBonus(los.cover), 2);
  });

  await t.test("Combat turn management and HP damage application", () => {
    const combat = initializeCombat([
      {
        id: "p1",
        name: "Valerius",
        isPlayer: true,
        isCompanion: false,
        isEnemy: false,
        armorClass: 16,
        currentHp: 20,
        maxHp: 20,
        tempHp: 5,
        speed: 30,
        initiativeModifier: 2,
        conditions: [],
        gridPosition: { x: 2, y: 2 },
        portrait: "/assets/images/archetypes/warrior.jpg",
        weaponAttackBonus: 5,
        weaponDamageDice: "1d8+3",
        weaponDamageType: "slashing",
      },
      {
        id: "e1",
        name: "Skeleton",
        isPlayer: false,
        isCompanion: false,
        isEnemy: true,
        armorClass: 13,
        currentHp: 13,
        maxHp: 13,
        tempHp: 0,
        speed: 30,
        initiativeModifier: 2,
        conditions: [],
        gridPosition: { x: 5, y: 5 },
        portrait: "/assets/images/enemies/skeleton.jpg",
        weaponAttackBonus: 4,
        weaponDamageDice: "1d6+2",
        weaponDamageType: "piercing",
      },
    ]);

    assert.strictEqual(combat.isActive, true);
    assert.strictEqual(combat.combatants.length, 2);

    const advanced = advanceTurn(combat);
    assert.strictEqual(advanced.activeTurnIndex, 1);

    // Apply damage to p1 (absorbs 5 temp HP, 3 normal HP)
    const p1 = combat.combatants.find((c) => c.id === "p1")!;
    const result = applyDamageToCombatant(p1, 8);
    assert.strictEqual(result.combatant.tempHp, 0);
    assert.strictEqual(result.combatant.currentHp, 17);
    assert.strictEqual(result.died, false);
  });
});