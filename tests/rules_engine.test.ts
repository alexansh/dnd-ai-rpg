import test from "node:test";
import assert from "node:assert";
import { resolveEngineRequest } from "../lib/engine/resolver";
import { tickConditions, getConditionModifiers, ActiveCondition } from "../lib/engine/conditions";
import { calculateConcentrationDc, resolveConcentrationCheck } from "../lib/engine/concentration";

test("Rules Engine: EngineRequest Resolver", async (t) => {
  await t.test("resolves ability check deterministically against DC", () => {
    const res = resolveEngineRequest({
      type: "ability_check",
      ability: "str",
      abilityScore: 16, // +3
      isProficient: true,
      proficiencyBonus: 2, // +5 total
      dc: 15,
      reason: "Force heavy portcullis",
    });

    assert.strictEqual(res.request.type, "ability_check");
    assert.ok(res.total >= 6 && res.total <= 25);
    assert.strictEqual(res.success, res.total >= 15);
  });

  await t.test("resolves attack roll vs AC with cover", () => {
    const res = resolveEngineRequest({
      type: "attack_roll",
      attackerId: "p1",
      targetId: "m1",
      weaponOrSpellId: "longsword",
      attackBonus: 5,
      targetAc: 14,
      coverBonus: 2, // effective AC 16
    });

    assert.strictEqual(res.request.type, "attack_roll");
    assert.ok(res.total >= 6 && res.total <= 25);
    if (res.isCrit) {
      assert.strictEqual(res.success, true);
    } else if (res.isFumble) {
      assert.strictEqual(res.success, false);
    } else {
      assert.strictEqual(res.success, res.total >= 16);
    }
  });

  await t.test("resolves damage roll with resistances and immunities", () => {
    const resResistant = resolveEngineRequest({
      type: "damage_roll",
      sourceId: "p1",
      targetId: "m1",
      formula: "2d6+3",
      damageType: "fire",
      resistances: ["fire"],
    });
    // raw damage min 5, max 15, halved
    assert.ok(resResistant.total >= 2 && resResistant.total <= 7);

    const resImmune = resolveEngineRequest({
      type: "damage_roll",
      sourceId: "p1",
      targetId: "m1",
      formula: "2d6+3",
      damageType: "poison",
      immunities: ["poison"],
    });
    assert.strictEqual(resImmune.total, 0);
  });
});

test("Rules Engine: Conditions & Concentration", async (t) => {
  await t.test("ticks condition durations correctly and expires after rounds", () => {
    const conditions: ActiveCondition[] = [
      { id: "c1", condition: "blinded", source: "spell", roundsRemaining: 2 },
      { id: "c2", condition: "poisoned", source: "trap", roundsRemaining: 1 },
      { id: "c3", condition: "prone", source: "trip" }, // indefinite until stand up
    ];

    const tick1 = tickConditions(conditions);
    assert.strictEqual(tick1.active.length, 2);
    assert.strictEqual(tick1.expired.length, 1);
    assert.strictEqual(tick1.expired[0].condition, "poisoned");

    const tick2 = tickConditions(tick1.active);
    assert.strictEqual(tick2.active.length, 1);
    assert.strictEqual(tick2.expired.length, 1);
    assert.strictEqual(tick2.expired[0].condition, "blinded");
  });

  await t.test("condition modifiers compute disadvantage and advantage correctly", () => {
    const conditions: ActiveCondition[] = [
      { id: "c1", condition: "restrained", source: "vines" },
    ];
    const mods = getConditionModifiers(conditions);
    assert.strictEqual(mods.isSpeedZero, true);
    assert.strictEqual(mods.hasAttackDisadvantage, true);
    assert.strictEqual(mods.meleeAttackersHaveAdvantage, true);
  });

  await t.test("concentration DC is max(10, floor(damage/2))", () => {
    assert.strictEqual(calculateConcentrationDc(4), 10);
    assert.strictEqual(calculateConcentrationDc(10), 10);
    assert.strictEqual(calculateConcentrationDc(20), 10);
    assert.strictEqual(calculateConcentrationDc(26), 13);
    assert.strictEqual(calculateConcentrationDc(35), 17);
  });
});
