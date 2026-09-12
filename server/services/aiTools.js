import { executeDiceRoll, resolveCheck, resolveAttack } from './rulesEngine.js';
import { interactWithWorldObject, advanceWorldTime } from './worldEngine.js';
import { adjustCompanionLoyalty } from './companionEngine.js';
import { advanceQuestObjective } from './questEngine.js';

/**
 * 🛠️ Controlled AI Tool Execution & Prompt Injection Defense
 * Security boundary between generative LLM and deterministic game truth.
 */

export const AI_TOOL_DEFINITIONS = [
  {
    name: 'roll_dice',
    description: 'Rolls polyhedral dice using server cryptographic PRNG',
    parameters: {
      type: 'object',
      properties: {
        notation: { type: 'string', description: 'Dice notation (e.g. 1d20, 2d6+3, 2d20kh1)' }
      },
      required: ['notation']
    }
  },
  {
    name: 'skill_check',
    description: 'Executes a server-authoritative D&D 5e ability or skill check against a DC',
    parameters: {
      type: 'object',
      properties: {
        ability: { type: 'string', enum: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] },
        skill: { type: 'string' },
        dc: { type: 'number' },
        advantage: { type: 'boolean' },
        disadvantage: { type: 'boolean' }
      },
      required: ['ability', 'dc']
    }
  },
  {
    name: 'attack_enemy',
    description: 'Resolves attack roll against target Armor Class and applies damage',
    parameters: {
      type: 'object',
      properties: {
        attackBonus: { type: 'number' },
        targetAc: { type: 'number' },
        damageNotation: { type: 'string' },
        damageType: { type: 'string' }
      },
      required: ['attackBonus', 'targetAc']
    }
  },
  {
    name: 'interact_object',
    description: 'Interacts with a world object (chest, door, lever) with server check',
    parameters: {
      type: 'object',
      properties: {
        objectId: { type: 'string' },
        action: { type: 'string', enum: ['inspect', 'pick_lock', 'force_open', 'loot'] }
      },
      required: ['objectId', 'action']
    }
  }
];

/**
 * Executes a tool requested by the AI with strict validation
 */
export async function executeAiTool(toolName, args = {}, context = {}) {
  switch (toolName) {
    case 'roll_dice': {
      const notation = (args.notation || '1d20').trim();
      return executeDiceRoll(notation);
    }

    case 'skill_check': {
      const { character } = context;
      return resolveCheck({
        character,
        ability: args.ability || 'STR',
        skill: args.skill || null,
        dc: args.dc || 12,
        advantage: Boolean(args.advantage),
        disadvantage: Boolean(args.disadvantage)
      });
    }

    case 'attack_enemy': {
      const { attacker, defender } = context;
      return resolveAttack({
        attacker: attacker || { name: 'Player' },
        defender: defender || { name: 'Target', ac: args.targetAc || 12, hp: 20 },
        attackBonus: args.attackBonus || 0,
        damageNotation: args.damageNotation || '1d8',
        damageType: args.damageType || 'slashing'
      });
    }

    case 'interact_object': {
      const { worldState } = context;
      return interactWithWorldObject({
        worldState: worldState || {},
        objectId: args.objectId,
        action: args.action,
        diceResult: args.diceResult || 0
      });
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Sanitizes untrusted user input to prevent prompt injection and rule bypass
 */
export function sanitizePlayerInput(input = '') {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[^\w\s.,!?'"()\-:;]/gi, ' ') // Strip special control symbols
    .replace(/\[\/?(SYSTEM|RULES|ADMIN|GAME_STATE|CANON)\]/gi, '') // Strip fake delimiters
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500); // Limit input length to 500 characters
}

/**
 * Constructs prompt with defense boundaries
 */
export function buildSafePromptSections({
  systemRules = '',
  campaignCanon = '',
  worldState = {},
  toolResults = null,
  playerInput = ''
}) {
  const cleanInput = sanitizePlayerInput(playerInput);

  return `
=== [SYSTEM RULES] ===
${systemRules}

=== [CAMPAIGN CANON & WORLD BIBLE] ===
${campaignCanon}

=== [AUTHORITATIVE GAME STATE] ===
Location: ${worldState.currentLocation || 'Unknown'}
Day: ${worldState.day || 1}, Time: ${worldState.time || 'morning'}, Weather: ${worldState.weather || 'clear'}
World Flags: ${JSON.stringify(worldState.flags || {})}

${toolResults ? `=== [SERVER TOOL EXECUTION RESULTS] ===\n${JSON.stringify(toolResults, null, 2)}` : ''}

=== [UNTRUSTED PLAYER INPUT] ===
"${cleanInput}"
`.trim();
}
