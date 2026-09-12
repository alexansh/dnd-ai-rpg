import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  getLoyaltyTier,
  adjustCompanionLoyalty,
  decideCompanionCombatAction
} from '../services/companionEngine.js';

describe('Phase 5: Companion System & Social Phases', () => {
  test('getLoyaltyTier: maps approval score to correct tier and breaking point', () => {
    assert.strictEqual(getLoyaltyTier(95), 'DEVOTED');
    assert.strictEqual(getLoyaltyTier(80), 'DEVOTED');
    assert.strictEqual(getLoyaltyTier(75), 'LOYAL');
    assert.strictEqual(getLoyaltyTier(50), 'NEUTRAL');
    assert.strictEqual(getLoyaltyTier(20), 'DISTRUSTFUL');
    assert.strictEqual(getLoyaltyTier(-30), 'HOSTILE');
    assert.strictEqual(getLoyaltyTier(-70), 'BREAKING_POINT');
    assert.strictEqual(getLoyaltyTier(-95), 'BREAKING_POINT');
  });

  test('adjustCompanionLoyalty: shifts approval based on ethical triggers', () => {
    const thalia = { id: 'thalia', name: 'Sister Thalia', approval: 50 };

    // Showing mercy increases Thalia's approval (+12)
    const mercyResult = adjustCompanionLoyalty(thalia, 'mercy_shown', 'Spared the wounded deserter');
    assert.strictEqual(mercyResult.delta, 12);
    assert.strictEqual(mercyResult.newApproval, 62);
    assert.strictEqual(mercyResult.tier, 'Loyal');
    assert.strictEqual(mercyResult.isMutiny, false);

    // Executing prisoner drops Thalia's approval heavily (-18)
    const execResult = adjustCompanionLoyalty(thalia, 'execute_prisoner', 'Executed prisoner in cold blood');
    assert.strictEqual(execResult.delta, -18);
    assert.strictEqual(execResult.newApproval, 32);
    assert.strictEqual(execResult.tier, 'Distrustful');
  });

  test('adjustCompanionLoyalty: triggers mutiny/abandonment when reaching breaking point', () => {
    const disgruntledCompanion = { id: 'thalia', name: 'Sister Thalia', approval: -60 };

    // Severe betrayal drops below -70
    const breakingResult = adjustCompanionLoyalty(disgruntledCompanion, 'execute_prisoner', 'Massacred captives');
    assert.strictEqual(breakingResult.isMutiny, true);
    assert.strictEqual(breakingResult.tier, 'Mutiny / Abandonment');
    assert.ok(breakingResult.departureDialogue);
    assert.ok(breakingResult.departureDialogue.includes('Sister Thalia'));
  });

  test('decideCompanionCombatAction: Cleric prioritizes healing wounded ally', () => {
    const cleric = { id: 'thalia', name: 'Sister Thalia', class: 'Cleric', hp: 20, maxHp: 20 };
    const healthyHero = { id: 'hero', name: 'Alden', hp: 25, maxHp: 25 };
    const dyingRogue = { id: 'valen', name: 'Valen', hp: 6, maxHp: 22 }; // 27% HP (critical)
    const goblin = { name: 'Goblin', hp: 12 };

    const decision = decideCompanionCombatAction(cleric, {
      party: [healthyHero, dyingRogue],
      enemies: [goblin]
    });

    assert.strictEqual(decision.action, 'cast_spell');
    assert.strictEqual(decision.spellName, 'Healing Word');
    assert.strictEqual(decision.targetName, 'Valen');
    assert.ok(decision.healAmount >= 4);
  });

  test('decideCompanionCombatAction: Rogue performs sneak attack on vulnerable enemy', () => {
    const rogue = { id: 'valen', name: 'Valen Shadowstep', class: 'Rogue', hp: 20, maxHp: 20 };
    const enemy1 = { name: 'Orc Chieftain', hp: 35 };
    const enemy2 = { name: 'Goblin Archer', hp: 8 }; // vulnerable lowest HP

    const decision = decideCompanionCombatAction(rogue, {
      party: [rogue],
      enemies: [enemy1, enemy2]
    });

    assert.strictEqual(decision.action, 'sneak_attack');
    assert.strictEqual(decision.targetName, 'Goblin Archer');
    assert.ok(decision.damageRoll >= 6);
  });
});
