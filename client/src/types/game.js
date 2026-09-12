/**
 * @file game.js - Core Data Contracts for The Wayward Flagon RPG Engine
 * Defines rigid schemas for Player, Party, World State, Scene Nodes, and State Mutations.
 */

/**
 * Loyalty Tiers for Party Companions (-100 to +100 scale)
 * @enum {string}
 */
export const LoyaltyTier = {
  DEVOTED: 'Devoted Ally',      // +70 to +100
  LOYAL: 'Loyal Companion',     // +25 to +69
  NEUTRAL: 'Neutral Ally',      // -24 to +24
  DISTRUSTFUL: 'Distrustful',   // -69 to -25
  HOSTILE: 'Hostile / Breaking' // -100 to -70 (trigges desertion or mutiny)
};

/**
 * Calculates companion loyalty tier from numerical score
 * @param {number} loyalty 
 * @returns {{ tier: string, color: string, icon: string }}
 */
export function getLoyaltyTier(loyalty = 0) {
  if (loyalty >= 70) return { tier: LoyaltyTier.DEVOTED, color: 'text-amber-300 border-amber-400 bg-amber-950/60', icon: '🌟' };
  if (loyalty >= 25) return { tier: LoyaltyTier.LOYAL, color: 'text-emerald-400 border-emerald-500 bg-emerald-950/60', icon: '🛡️' };
  if (loyalty >= -24) return { tier: LoyaltyTier.NEUTRAL, color: 'text-stone-300 border-stone-600 bg-stone-900/60', icon: '⚖️' };
  if (loyalty >= -69) return { tier: LoyaltyTier.DISTRUSTFUL, color: 'text-orange-400 border-orange-500 bg-orange-950/60', icon: '⚠️' };
  return { tier: LoyaltyTier.HOSTILE, color: 'text-red-500 border-red-600 bg-red-950/60', icon: '💀' };
}

/**
 * Morality Axes (-100 to +100)
 * Benevolence: Altruistic (+100) vs. Ruthless (-100)
 * Order: Lawful / Structured (+100) vs. Chaotic / Free (+100)
 * @typedef {Object} MoralityProfile
 * @property {number} benevolence
 * @property {number} order
 */

/**
 * Player State Definition
 * @typedef {Object} PlayerState
 * @property {string} id
 * @property {string} name
 * @property {string} class
 * @property {string} race
 * @property {number} level
 * @property {number} hp
 * @property {number} maxHp
 * @property {number} tempHp
 * @property {Record<string, number>} stats - STR, DEX, CON, INT, WIS, CHA
 * @property {string[]} inventory
 * @property {number} gold
 * @property {MoralityProfile} morality
 * @property {string[]} tags - Titles, accolades, and narrative flags
 * @property {string} portraitUrl
 */

/**
 * Companion Definition
 * @typedef {Object} CompanionState
 * @property {string} id
 * @property {string} name
 * @property {string} class
 * @property {string} role
 * @property {string} portraitUrl
 * @property {number} loyalty - Range -100 to 100
 * @property {number} breakingPoint - e.g. -60
 * @property {string} mood - 'Approving' | 'Wary' | 'Inspired' | 'Disgusted' | 'Quiet'
 * @property {string[]} ethicalValues - e.g. ['Mercy', 'Honesty', 'Sanctity of Life']
 * @property {boolean} isFallen
 * @property {number} hp
 * @property {number} maxHp
 */

/**
 * Decision Choice Contract
 * @typedef {Object} DecisionChoice
 * @property {string} id
 * @property {string} label
 * @property {string} icon - Lucide icon key
 * @property {'action' | 'dialogue' | 'check' | 'travel'} type
 * @property {string} [checkAbility] - 'STR' | 'DEX' | 'INT' | 'WIS' | 'CHA'
 * @property {number} [checkDc]
 * @property {string} [targetNodeId] - Target scene node on selection
 * @property {Record<string, number>} [companionAffinities] - Predicted shifts
 * @property {string} [description]
 */

/**
 * Scene Node Definition
 * @typedef {Object} SceneNode
 * @property {string} id
 * @property {string} title
 * @property {number} act
 * @property {string} location
 * @property {string} environment
 * @property {string} bgImage
 * @property {string} ambientMood
 * @property {string} sensoryPremise
 * @property {DecisionChoice[]} fixedChoices
 * @property {Array<{ id: string, label: string, inspect: string, check: string, dc: number }>} hotspots
 * @property {string[]} connectedNodeIds
 */

/**
 * State Mutation Contract
 * @typedef {Object} StateMutation
 * @property {number} [hpDelta]
 * @property {number} [tempHpDelta]
 * @property {number} [goldDelta]
 * @property {string[]} [itemsAdded]
 * @property {string[]} [itemsRemoved]
 * @property {Array<{ companionId: string, delta: number, reason: string }>} [loyaltyDeltas]
 * @property {Record<string, any>} [flagMutations]
 * @property {Partial<MoralityProfile>} [moralityDelta]
 * @property {string} [targetNodeId]
 */
