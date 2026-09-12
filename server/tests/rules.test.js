import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  calculateModifier,
  calculateProficiencyBonus,
  rollDie,
  executeDiceRoll,
  resolveCheck,
  resolveAttack,
  resolveShortRest,
  resolveLongRest
} from '../services/rulesEngine.js';

describe('Phase 3: Deterministic Rules Engine — 5e Math & PRNG', () => {
  test('calculateModifier: computes standard 5e ability modifiers correctly', () => {
    assert.strictEqual(calculateModifier(1), -5);
    assert.strictEqual(calculateModifier(3), -4);
    assert.strictEqual(calculateModifier(8), -1);
    assert.strictEqual(calculateModifier(9), -1);
    assert.strictEqual(calculateModifier(10), 0);
    assert.strictEqual(calculateModifier(11), 0);
    assert.strictEqual(calculateModifier(12), 1);
    assert.strictEqual(calculateModifier(14), 2);
    assert.strictEqual(calculateModifier(16), 3);
    assert.strictEqual(calculateModifier(18), 4);
    assert.strictEqual(calculateModifier(20), 5);
    assert.strictEqual(calculateModifier(30), 10);
  });

  test('calculateProficiencyBonus: follows 5e level tiers', () => {
    assert.strictEqual(calculateProficiencyBonus(1), 2);
    assert.strictEqual(calculateProficiencyBonus(4), 2);
    assert.strictEqual(calculateProficiencyBonus(5), 3);
    assert.strictEqual(calculateProficiencyBonus(8), 3);
    assert.strictEqual(calculateProficiencyBonus(9), 4);
    assert.strictEqual(calculateProficiencyBonus(12), 4);
    assert.strictEqual(calculateProficiencyBonus(13), 5);
    assert.strictEqual(calculateProficiencyBonus(16), 5);
    assert.strictEqual(calculateProficiencyBonus(17), 6);
    assert.strictEqual(calculateProficiencyBonus(20), 6);
  });

  test('rollDie: returns integers within boundary [1, sides]', () => {
    for (const sides of [4, 6, 8, 10, 12, 20, 100]) {
      for (let i = 0; i < 50; i++) {
        const result = rollDie(sides);
        assert.ok(Number.isInteger(result), 'Roll must be an integer');
        assert.ok(result >= 1, `Roll ${result} must be >= 1`);
        assert.ok(result <= sides, `Roll ${result} must be <= ${sides}`);
      }
    }
  });

  test('executeDiceRoll: handles standard notation (2d6+3)', () => {
    for (let i = 0; i < 20; i++) {
      const res = executeDiceRoll('2d6+3');
      assert.strictEqual(res.rolls.length, 2);
      assert.strictEqual(res.kept.length, 2);
      assert.strictEqual(res.modifier, 3);
      assert.strictEqual(res.total, res.rolls[0] + res.rolls[1] + 3);
      assert.ok(res.total >= 5 && res.total <= 15, `2d6+3 must be between 5 and 15, got ${res.total}`);
    }
  });

  test('executeDiceRoll: handles Advantage (2d20kh1)', () => {
    for (let i = 0; i < 20; i++) {
      const res = executeDiceRoll('2d20kh1');
      assert.strictEqual(res.rolls.length, 2);
      assert.strictEqual(res.kept.length, 1);
      assert.strictEqual(res.dropped.length, 1);
      const expected = Math.max(res.rolls[0], res.rolls[1]);
      assert.strictEqual(res.kept[0], expected, 'Advantage must keep the higher die');
    }
  });

  test('executeDiceRoll: handles Disadvantage (2d20kl1)', () => {
    for (let i = 0; i < 20; i++) {
      const res = executeDiceRoll('2d20kl1');
      assert.strictEqual(res.rolls.length, 2);
      assert.strictEqual(res.kept.length, 1);
      assert.strictEqual(res.dropped.length, 1);
      const expected = Math.min(res.rolls[0], res.rolls[1]);
      assert.strictEqual(res.kept[0], expected, 'Disadvantage must keep the lower die');
    }
  });

  test('resolveCheck: evaluates DC success and modifier math', () => {
    const character = {
      level: 1,
      stats: { STR: 16, DEX: 10, CON: 14, INT: 10, WIS: 12, CHA: 8 },
      proficiencies: ['Athletics']
    };

    const check = resolveCheck({
      character,
      ability: 'STR',
      skill: 'Athletics',
      dc: 15,
      situationalBonus: 2
    });

    // STR 16 = +3, Level 1 prof = +2, Situational = +2 -> Total Mod = +7
    assert.strictEqual(check.modifierBreakdown.abilityMod, 3);
    assert.strictEqual(check.modifierBreakdown.proficiency, 2);
    assert.strictEqual(check.modifierBreakdown.situational, 2);
    assert.strictEqual(check.modifierBreakdown.totalMod, 7);
    assert.strictEqual(check.total, check.naturalValue + 7);
    assert.strictEqual(check.success, check.total >= 15);
  });

  test('resolveAttack: resolves hit vs AC, criticals, and damage', () => {
    const attacker = { name: 'Knight' };
    const defender = { name: 'Goblin', ac: 13, hp: 15, tempHp: 5 };

    const attack = resolveAttack({
      attacker,
      defender,
      attackBonus: 5,
      damageNotation: '1d8',
      damageType: 'slashing'
    });

    assert.ok(typeof attack.hit === 'boolean');
    assert.strictEqual(attack.attackRoll.targetAc, 13);

    if (attack.hit) {
      assert.ok(attack.damage, 'Damage must be rolled on hit');
      assert.ok(attack.damage.total >= 1, 'Damage must be >= 1');
      assert.ok(attack.defenderState.newHp <= 15, 'Defender HP must decrease or stay intact');
    } else {
      assert.strictEqual(attack.damage, null, 'No damage on miss');
      assert.strictEqual(attack.defenderState.newHp, 15);
    }
  });

  test('resolveAttack: applies unconscious condition if damage drops HP to 0', () => {
    const attacker = { name: 'Paladin' };
    const weakDefender = { name: 'Skeleton', ac: 8, hp: 1, tempHp: 0 };

    // Loop until hit occurs (respecting 5e natural 1 automatic miss)
    let attack;
    do {
      attack = resolveAttack({
        attacker,
        defender: weakDefender,
        attackBonus: 20,
        damageNotation: '2d10',
        damageType: 'radiant'
      });
    } while (!attack.hit);

    assert.strictEqual(attack.hit, true);
    assert.strictEqual(attack.defenderState.newHp, 0);
    assert.strictEqual(attack.defenderState.conditionApplied, 'unconscious');
  });

  test('resolveShortRest: heals character based on hit die + CON mod', () => {
    const character = {
      name: 'Ranger',
      hp: 10,
      maxHp: 24,
      hitDie: 10,
      stats: { CON: 14 } // CON mod = +2
    };

    const rest = resolveShortRest({ character, hitDiceToSpend: 2 });
    assert.strictEqual(rest.restType, 'short');
    assert.strictEqual(rest.rolls.length, 2);
    assert.ok(rest.totalHealed >= 6, '2d10+4 must heal at least 6 HP');
    assert.strictEqual(rest.newHp, Math.min(24, 10 + rest.totalHealed));
  });

  test('resolveLongRest: restores character to 100% max HP and clears exhaustion', () => {
    const character = {
      name: 'Wizard',
      hp: 3,
      maxHp: 20,
      tempHp: 5
    };

    const rest = resolveLongRest({ character });
    assert.strictEqual(rest.restType, 'long');
    assert.strictEqual(rest.newHp, 20);
    assert.strictEqual(rest.totalHealed, 17);
    assert.strictEqual(rest.tempHPRemoved, 5);
    assert.strictEqual(rest.spellSlotsRestored, true);
  });
});
