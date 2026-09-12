import crypto from 'crypto';

/**
 * 🎲 Server-Authoritative Cryptographic Rules Engine (D&D 5e)
 * All dice rolls, skill checks, combat math, and rests are deterministic & cheat-proof.
 */

export const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export const SKILL_ABILITY_MAP = {
  Athletics: 'STR',
  Acrobatics: 'DEX',
  'Sleight of Hand': 'DEX',
  Stealth: 'DEX',
  Arcana: 'INT',
  History: 'INT',
  Investigation: 'INT',
  Nature: 'INT',
  Religion: 'INT',
  'Animal Handling': 'WIS',
  Insight: 'WIS',
  Medicine: 'WIS',
  Perception: 'WIS',
  Survival: 'WIS',
  Deception: 'CHA',
  Intimidation: 'CHA',
  Performance: 'CHA',
  Persuasion: 'CHA'
};

/**
 * Computes standard D&D 5e ability modifier: Math.floor((score - 10) / 2)
 */
export function calculateModifier(score) {
  const num = typeof score === 'number' ? score : 10;
  return Math.floor((num - 10) / 2);
}

/**
 * Calculates proficiency bonus by character level
 */
export function calculateProficiencyBonus(level = 1) {
  const lvl = Math.max(1, Math.min(20, level));
  return Math.floor((lvl - 1) / 4) + 2;
}

/**
 * Cryptographically secure random integer between 1 and sides (inclusive)
 */
export function rollDie(sides = 20) {
  if (sides < 1) throw new Error('Sides must be >= 1');
  return crypto.randomInt(1, sides + 1);
}

/**
 * Parses and executes standard D&D dice notation:
 * Supports:
 * - "1d20"
 * - "2d6+3"
 * - "1d20-2"
 * - "2d20kh1" (Advantage: Keep highest 1)
 * - "2d20kl1" (Disadvantage: Keep lowest 1)
 * - "4d6kh3" (Character stat rolling)
 */
export function executeDiceRoll(notation = '1d20', options = {}) {
  const clean = notation.trim().toLowerCase();
  const match = clean.match(/^(\d+)d(\d+)(?:(kh|kl)(\d+))?([+-]\d+)?$/);

  if (!match) {
    // Fallback simple d20
    const raw = rollDie(20);
    const mod = options.modifier || 0;
    return {
      notation: '1d20',
      rolls: [raw],
      kept: [raw],
      dropped: [],
      modifier: mod,
      total: raw + mod,
      isCrit: raw === 20,
      isCritFail: raw === 1
    };
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const keepMode = match[3]; // 'kh' or 'kl'
  const keepCount = match[4] ? parseInt(match[4], 10) : 1;
  const notationMod = match[5] ? parseInt(match[5], 10) : 0;
  const totalMod = notationMod + (options.modifier || 0);

  const rawRolls = [];
  for (let i = 0; i < count; i++) {
    rawRolls.push(rollDie(sides));
  }

  let kept = [...rawRolls];
  let dropped = [];

  if (keepMode === 'kh') {
    const sorted = [...rawRolls].sort((a, b) => b - a);
    kept = sorted.slice(0, keepCount);
    dropped = sorted.slice(keepCount);
  } else if (keepMode === 'kl') {
    const sorted = [...rawRolls].sort((a, b) => a - b);
    kept = sorted.slice(0, keepCount);
    dropped = sorted.slice(keepCount);
  }

  const sumKept = kept.reduce((a, b) => a + b, 0);
  const total = sumKept + totalMod;

  const isD20 = sides === 20 && kept.length === 1;
  const naturalValue = isD20 ? kept[0] : null;

  return {
    notation,
    sides,
    rolls: rawRolls,
    kept,
    dropped,
    modifier: totalMod,
    total,
    naturalValue,
    isCrit: isD20 && naturalValue === 20,
    isCritFail: isD20 && naturalValue === 1
  };
}

/**
 * Executes a server-authoritative ability or skill check
 */
export function resolveCheck({
  character,
  ability = 'STR',
  skill = null,
  dc = 12,
  advantage = false,
  disadvantage = false,
  situationalBonus = 0
}) {
  const normAbility = (ability || 'STR').toUpperCase();
  const abilityScore = character?.stats?.[normAbility] ?? 10;
  const abilityMod = calculateModifier(abilityScore);
  const profBonus = calculateProficiencyBonus(character?.level || 1);

  // Check if character is proficient in this skill
  const isProficient = skill && Array.isArray(character?.proficiencies)
    ? character.proficiencies.includes(skill)
    : false;

  const totalMod = abilityMod + (isProficient ? profBonus : 0) + situationalBonus;

  // Determine dice notation based on advantage/disadvantage
  let notation = '1d20';
  if (advantage && !disadvantage) {
    notation = '2d20kh1';
  } else if (disadvantage && !advantage) {
    notation = '2d20kl1';
  }

  const rollResult = executeDiceRoll(notation, { modifier: totalMod });

  const success = rollResult.isCrit
    ? true
    : rollResult.isCritFail
    ? false
    : rollResult.total >= dc;

  return {
    ability: normAbility,
    skill,
    dc,
    advantage,
    disadvantage,
    rolls: rollResult.rolls,
    kept: rollResult.kept,
    naturalValue: rollResult.naturalValue,
    modifierBreakdown: {
      abilityScore,
      abilityMod,
      proficiency: isProficient ? profBonus : 0,
      situational: situationalBonus,
      totalMod
    },
    total: rollResult.total,
    success,
    critical: rollResult.isCrit ? 'success' : rollResult.isCritFail ? 'failure' : null,
    margin: rollResult.total - dc,
    timestamp: new Date().toISOString()
  };
}

/**
 * Resolves a combat attack roll against Armor Class (AC)
 */
export function resolveAttack({
  attacker,
  defender,
  attackBonus = 0,
  damageNotation = '1d8',
  damageType = 'slashing',
  advantage = false,
  disadvantage = false
}) {
  const targetAc = defender?.ac || defender?.stats?.armorClass || 10;

  // Determine attack roll notation
  let notation = '1d20';
  if (advantage && !disadvantage) {
    notation = '2d20kh1';
  } else if (disadvantage && !advantage) {
    notation = '2d20kl1';
  }

  const attackRoll = executeDiceRoll(notation, { modifier: attackBonus });
  const isCrit = attackRoll.isCrit;
  const isCritFail = attackRoll.isCritFail;

  let isHit = false;
  if (isCrit) {
    isHit = true;
  } else if (isCritFail) {
    isHit = false;
  } else {
    isHit = attackRoll.total >= targetAc;
  }

  let damageResult = null;
  let newDefenderHp = defender?.hp ?? 10;
  let newDefenderTempHp = defender?.tempHp ?? 0;
  let conditionApplied = null;

  if (isHit) {
    // If critical hit, roll damage dice twice
    let finalDamageNotation = damageNotation;
    if (isCrit) {
      const parts = damageNotation.match(/^(\d+)d(\d+)(.*)$/);
      if (parts) {
        const doubledDice = parseInt(parts[1], 10) * 2;
        finalDamageNotation = `${doubledDice}d${parts[2]}${parts[3]}`;
      }
    }

    damageResult = executeDiceRoll(finalDamageNotation);
    const damageAmount = Math.max(1, damageResult.total);

    // Apply damage to temporary HP first, then main HP
    let remainingDamage = damageAmount;
    if (newDefenderTempHp > 0) {
      if (newDefenderTempHp >= remainingDamage) {
        newDefenderTempHp -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= newDefenderTempHp;
        newDefenderTempHp = 0;
      }
    }

    newDefenderHp = Math.max(0, newDefenderHp - remainingDamage);

    if (newDefenderHp === 0) {
      conditionApplied = 'unconscious';
    }
  }

  return {
    hit: isHit,
    isCrit,
    isCritFail,
    attackRoll: {
      notation,
      rolls: attackRoll.rolls,
      naturalValue: attackRoll.naturalValue,
      total: attackRoll.total,
      targetAc
    },
    damage: damageResult ? {
      notation: damageResult.notation,
      rolls: damageResult.rolls,
      total: damageResult.total,
      damageType
    } : null,
    defenderState: {
      previousHp: defender?.hp ?? 10,
      newHp: newDefenderHp,
      previousTempHp: defender?.tempHp ?? 0,
      newTempHp: newDefenderTempHp,
      conditionApplied
    }
  };
}

/**
 * Resolves a character Short Rest (Hit Dice expenditure)
 */
export function resolveShortRest({ character, hitDiceToSpend = 1 }) {
  if (!character) throw new Error('Character is required for rest');

  const currentHp = character.hp || 1;
  const maxHp = character.maxHp || 10;
  const hitDie = character.hitDie || 8;
  const conMod = calculateModifier(character.stats?.CON ?? 10);

  let totalHealed = 0;
  const rolls = [];

  for (let i = 0; i < hitDiceToSpend; i++) {
    const roll = rollDie(hitDie);
    const healFromDie = Math.max(1, roll + conMod);
    rolls.push({ roll, conMod, heal: healFromDie });
    totalHealed += healFromDie;
  }

  const finalHp = Math.min(maxHp, currentHp + totalHealed);

  return {
    restType: 'short',
    hitDiceSpent: hitDiceToSpend,
    rolls,
    totalHealed,
    previousHp: currentHp,
    newHp: finalHp,
    maxHp
  };
}

/**
 * Resolves a character Long Rest (Full HP and Hit Dice recovery)
 */
export function resolveLongRest({ character }) {
  if (!character) throw new Error('Character is required for rest');

  const currentHp = character.hp || 1;
  const maxHp = character.maxHp || 10;
  const healed = maxHp - currentHp;

  return {
    restType: 'long',
    totalHealed: healed,
    previousHp: currentHp,
    newHp: maxHp,
    maxHp,
    tempHPRemoved: character.tempHp || 0,
    spellSlotsRestored: true,
    conditionsCleared: ['exhaustion', 'poisoned']
  };
}
