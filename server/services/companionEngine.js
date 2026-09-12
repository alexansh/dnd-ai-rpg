import { eventBus, EVENTS } from './eventBus.js';
import { executeDiceRoll } from './rulesEngine.js';

/**
 * 🛡️ Companion System & Social Alignment Engine
 * Dual-axis loyalty tracking (-100 to 100), breaking point triggers, and tactical combat AI.
 */

export const LOYALTY_TIERS = {
  DEVOTED: { label: 'Devoted', min: 80, combatBonus: 2 },
  LOYAL: { label: 'Loyal', min: 60, combatBonus: 1 },
  NEUTRAL: { label: 'Neutral', min: 40, combatBonus: 0 },
  DISTRUSTFUL: { label: 'Distrustful', min: 10, combatBonus: -1 },
  HOSTILE: { label: 'Hostile', min: -69, combatBonus: -2 },
  BREAKING_POINT: { label: 'Mutiny / Abandonment', min: -100, isBreakingPoint: true }
};

export function getLoyaltyTier(approval = 50) {
  if (approval >= 80) return 'DEVOTED';
  if (approval >= 60) return 'LOYAL';
  if (approval >= 40) return 'NEUTRAL';
  if (approval >= 10) return 'DISTRUSTFUL';
  if (approval > -70) return 'HOSTILE';
  return 'BREAKING_POINT';
}

// Ethical triggers matrix for companions
export const ETHICAL_TRIGGERS = {
  thalia: {
    mercy_shown: +12,
    execute_prisoner: -18,
    defend_innocent: +10,
    steal_from_innocent: -12,
    sacred_relic_respected: +8
  },
  grimjaw: {
    direct_combat: +8,
    courageous_charge: +10,
    mercy_to_monsters: -8,
    cowardice_fleeing: -14,
    honoring_warriors: +10
  },
  valen: {
    stealth_tactics: +10,
    clever_deception: +10,
    blind_recklessness: -8,
    split_loot_fairly: +8,
    snitching_to_guards: -18
  },
  morwen: {
    arcane_study: +10,
    clever_problem_solving: +8,
    anti_magic_superstition: -12,
    power_unlocked: +10,
    reckless_destroy_tomes: -15
  }
};

/**
 * Evaluates companion approval changes based on player moral decisions
 */
export function adjustCompanionLoyalty(companion, triggerKey, reason = '') {
  const compId = companion.id;
  const triggerMap = ETHICAL_TRIGGERS[compId] || {};
  const delta = triggerMap[triggerKey] || 0;

  const currentApproval = typeof companion.approval === 'number' ? companion.approval : 50;
  const newApproval = Math.max(-100, Math.min(100, currentApproval + delta));
  const newTier = getLoyaltyTier(newApproval);
  const isMutiny = newTier === 'BREAKING_POINT';

  eventBus.emitGameEvent(EVENTS.COMPANION_APPROVAL_CHANGED, {
    companionId: compId,
    companionName: companion.name,
    previous: currentApproval,
    current: newApproval,
    delta,
    reason,
    tier: LOYALTY_TIERS[newTier].label,
    isMutiny
  });

  return {
    companionId: compId,
    previousApproval: currentApproval,
    newApproval,
    delta,
    reason,
    tier: LOYALTY_TIERS[newTier].label,
    isMutiny,
    departureDialogue: isMutiny ? `"${companion.name} spits upon the ground and draws their weapon. 'I would sooner walk into the abyss than follow you another step!'"` : null
  };
}

/**
 * Deterministic Companion Combat AI Decision Engine
 */
export function decideCompanionCombatAction(companion, { party = [], enemies = [] } = {}) {
  const currentHp = companion.hp || 10;
  const maxHp = companion.maxHp || 20;
  const compClass = (companion.class || '').toLowerCase();

  // 1. Cleric / Healer Priority: Heal any dying or critical ally (HP < 40%)
  if (compClass.includes('cleric')) {
    const woundedAlly = [...party].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
    if (woundedAlly && (woundedAlly.hp / woundedAlly.maxHp) <= 0.45) {
      const healRoll = executeDiceRoll('1d8+3');
      return {
        action: 'cast_spell',
        spellName: 'Healing Word',
        targetId: woundedAlly.id || woundedAlly.name,
        targetName: woundedAlly.name,
        healAmount: healRoll.total,
        narration: `${companion.name} raises their consecrated holy symbol, uttering a prayer of radiant restoration that restores ${healRoll.total} HP to ${woundedAlly.name}!`
      };
    }
  }

  // 2. Select target enemy
  if (enemies.length === 0) {
    return {
      action: 'defensive_stance',
      narration: `${companion.name} takes a defensive stance, guarding the perimeter.`
    };
  }

  // 3. Rogue Priority: Target lowest HP enemy with Sneak Attack
  if (compClass.includes('rogue')) {
    const target = [...enemies].sort((a, b) => a.hp - b.hp)[0];
    const attackRoll = executeDiceRoll('1d20+5');
    const damageRoll = executeDiceRoll('1d6+2d6+3');
    return {
      action: 'sneak_attack',
      targetName: target.name,
      attackRoll: attackRoll.total,
      damageRoll: damageRoll.total,
      narration: `${companion.name} slips into the shadows and executes a lethal sneak attack upon ${target.name} for ${damageRoll.total} piercing damage!`
    };
  }

  // 4. Tank / Warrior / Paladin Priority: Attack highest threat / nearest melee
  if (compClass.includes('warrior') || compClass.includes('fighter') || compClass.includes('paladin')) {
    const target = enemies[0];
    const attackRoll = executeDiceRoll('1d20+5');
    const damageRoll = executeDiceRoll('1d12+3');
    return {
      action: 'melee_cleave',
      targetName: target.name,
      attackRoll: attackRoll.total,
      damageRoll: damageRoll.total,
      narration: `${companion.name} lets out a thunderous battlecry, smashing their heavy weapon into ${target.name} for ${damageRoll.total} bludgeoning damage!`
    };
  }

  // 5. Default Mage / Ranged attack
  const defaultTarget = enemies[0];
  const spellRoll = executeDiceRoll('2d8+3');
  return {
    action: 'arcane_blast',
    targetName: defaultTarget.name,
    damageRoll: spellRoll.total,
    narration: `${companion.name} unleashes an incandescent arcane bolt, blasting ${defaultTarget.name} for ${spellRoll.total} force damage!`
  };
}
