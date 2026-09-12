/**
 * @file deterministicEngine.js - Strict Rule & Consequence Reducer
 * Pure, side-effect-free state transitions ensuring the LLM cannot hallucinate invalid state.
 */

/**
 * Validates and applies state mutations to the current game state
 * @param {Object} currentState 
 * @param {Object} mutations 
 * @returns {{ nextState: Object, consequences: string[], breakingCompanions: string[] }}
 */
export function applyStateMutations(currentState, mutations = {}) {
  const nextPlayer = { ...(currentState.player || {}) };
  const nextParty = (currentState.party || []).map(c => ({ ...c }));
  const nextWorldState = { ...(currentState.world_state || {}) };
  const consequences = [];
  const breakingCompanions = [];

  // 1. HP & Temp HP Mutations
  if (typeof mutations.hpDelta === 'number' && mutations.hpDelta !== 0) {
    const prevHp = nextPlayer.hp || 20;
    const maxHp = nextPlayer.maxHp || 20;
    nextPlayer.hp = Math.max(0, Math.min(maxHp, prevHp + mutations.hpDelta));
    consequences.push(
      mutations.hpDelta > 0
        ? `❤️ Restored ${mutations.hpDelta} HP (${nextPlayer.hp}/${maxHp})`
        : `🩸 Sustained ${Math.abs(mutations.hpDelta)} damage (${nextPlayer.hp}/${maxHp} HP)`
    );
  }

  // 2. Gold Mutations
  if (typeof mutations.goldDelta === 'number' && mutations.goldDelta !== 0) {
    const prevGold = nextPlayer.gold || 0;
    nextPlayer.gold = Math.max(0, prevGold + mutations.goldDelta);
    consequences.push(
      mutations.goldDelta > 0
        ? `💰 Acquired +${mutations.goldDelta} Gold Pieces`
        : `🪙 Spent ${Math.abs(mutations.goldDelta)} Gold Pieces`
    );
  }

  // 3. Inventory Mutations
  if (Array.isArray(mutations.itemsAdded) && mutations.itemsAdded.length > 0) {
    nextPlayer.inventory = [...(nextPlayer.inventory || []), ...mutations.itemsAdded];
    consequences.push(`🎒 Acquired items: ${mutations.itemsAdded.join(', ')}`);
  }

  if (Array.isArray(mutations.itemsRemoved) && mutations.itemsRemoved.length > 0) {
    const inv = [...(nextPlayer.inventory || [])];
    mutations.itemsRemoved.forEach(item => {
      const idx = inv.indexOf(item);
      if (idx > -1) inv.splice(idx, 1);
    });
    nextPlayer.inventory = inv;
    consequences.push(`🗑️ Removed: ${mutations.itemsRemoved.join(', ')}`);
  }

  // 4. Companion Loyalty Deltas & Breaking Point Checks (-100 to +100)
  if (Array.isArray(mutations.loyaltyDeltas)) {
    mutations.loyaltyDeltas.forEach(ld => {
      const companion = nextParty.find(
        c => c.id === ld.companionId || c.name.toLowerCase().includes(ld.companionId.toLowerCase())
      );
      if (companion) {
        const prevLoyalty = companion.loyalty ?? 50;
        const newLoyalty = Math.max(-100, Math.min(100, prevLoyalty + ld.delta));
        companion.loyalty = newLoyalty;

        const deltaFormatted = ld.delta > 0 ? `+${ld.delta}` : `${ld.delta}`;
        consequences.push(
          `${ld.delta > 0 ? '✨' : '⚡'} ${companion.name}: Loyalty ${deltaFormatted} (${newLoyalty}/100) — ${ld.reason || 'Reaction to your actions'}`
        );

        // Check breaking point
        const breakingThreshold = companion.breakingPoint || -60;
        if (newLoyalty <= breakingThreshold && prevLoyalty > breakingThreshold) {
          breakingCompanions.push(companion.name);
          consequences.push(`⚠️ WARNING: ${companion.name}'s loyalty is critically low and they may abandon the party!`);
        }
      }
    });
  }

  // 5. Morality Profile Updates
  if (mutations.moralityDelta) {
    nextPlayer.morality = nextPlayer.morality || { benevolence: 0, order: 0 };
    if (typeof mutations.moralityDelta.benevolence === 'number') {
      nextPlayer.morality.benevolence = Math.max(
        -100,
        Math.min(100, nextPlayer.morality.benevolence + mutations.moralityDelta.benevolence)
      );
    }
    if (typeof mutations.moralityDelta.order === 'number') {
      nextPlayer.morality.order = Math.max(
        -100,
        Math.min(100, nextPlayer.morality.order + mutations.moralityDelta.order)
      );
    }
  }

  // 6. World State Episodic Flags
  if (mutations.flagMutations && typeof mutations.flagMutations === 'object') {
    Object.assign(nextWorldState, mutations.flagMutations);
  }

  return {
    nextState: {
      ...currentState,
      player: nextPlayer,
      party: nextParty,
      world_state: nextWorldState,
      current_node: mutations.targetNodeId || currentState.current_node
    },
    consequences,
    breakingCompanions
  };
}
