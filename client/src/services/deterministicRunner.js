/**
 * Client-side Deterministic Consequence Reducer & Rule Engine
 * Guarantees zero hallucinations for stats, inventories, morality, loyalty, and narrative flags.
 */

export const MORALITY_THRESHOLDS = {
  LAWFUL_GOOD: { label: 'Shield of the Just', icon: '⚖️' },
  CHAOTIC_REBEL: { label: 'Rogue Freeblade', icon: '🗡️' },
  RUTHLESS_PRAGMATIST: { label: 'Iron Sovereign', icon: '👑' },
  NEUTRAL_SURVIVOR: { label: 'Wanderer of the Gray', icon: '🌲' }
};

/**
 * Applies deterministic mutation deltas to character, party, and story flags
 */
export function applyDeterministicStateMutation(currentState, mutation = {}) {
  const {
    character,
    companions = [],
    flags = [],
    moralityScore = 0
  } = currentState;

  if (!character) return currentState;

  // 1. Player HP & MaxHP
  const newMaxHp = Math.max(1, (character.maxHp || 20) + (mutation.maxHpDelta || 0));
  let newHp = Math.max(0, Math.min(newMaxHp, (character.hp || 20) + (mutation.hpDelta || 0)));

  // 2. Gold
  const newGold = Math.max(0, (character.gold || 0) + (mutation.goldDelta || 0));

  // 3. Inventory additions & removals
  let newInventory = [...(character.inventory || [])];
  if (Array.isArray(mutation.addItems)) {
    newInventory = [...newInventory, ...mutation.addItems];
  }
  if (Array.isArray(mutation.removeItems)) {
    mutation.removeItems.forEach(itemToRemove => {
      const idx = newInventory.findIndex(i => i.toLowerCase() === itemToRemove.toLowerCase());
      if (idx !== -1) {
        newInventory.splice(idx, 1);
      }
    });
  }

  // 4. Morality / Alignment
  const newMorality = Math.max(-100, Math.min(100, (moralityScore || 0) + (mutation.moralityDelta || 0)));

  // 5. Story Flags
  const newFlags = [...new Set([...flags, ...(mutation.setFlags || [])])];

  // 6. Companion Loyalty Deltas & Breaking Point Tracking
  const loyaltyChanges = mutation.loyaltyDeltas || {};
  const breakingCompanions = [];

  const updatedCompanions = companions.map(comp => {
    const delta = loyaltyChanges[comp.id] || loyaltyChanges[comp.name] || 0;
    const currentLoyalty = typeof comp.loyalty === 'number' ? comp.loyalty : (typeof comp.approval === 'number' ? comp.approval : 0);
    const newLoyalty = Math.max(-100, Math.min(100, currentLoyalty + delta));
    
    // Breaking point check
    if (newLoyalty <= -70 && currentLoyalty > -70) {
      breakingCompanions.push({
        id: comp.id,
        name: comp.name,
        reason: 'Loyalty collapsed into mutiny/departure'
      });
    }

    return {
      ...comp,
      loyalty: newLoyalty,
      approval: newLoyalty // Keep backward-compatible
    };
  });

  return {
    character: {
      ...character,
      hp: newHp,
      maxHp: newMaxHp,
      gold: newGold,
      inventory: newInventory
    },
    companions: updatedCompanions,
    flags: newFlags,
    moralityScore: newMorality,
    breakingCompanions,
    mutationApplied: mutation
  };
}
