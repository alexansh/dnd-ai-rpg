/**
 * World State Machine & Story Engine
 * Tracks quest milestones, story beats, player flags, reputation, and narrative pacing.
 */

export function createInitialWorldState(questId = 'goblin-cellar') {
  return {
    questId,
    questStage: 1, // 1: Entrance, 2: Mid-Dungeon/Obstacle, 3: Climax/Boss, 4: Resolution
    totalStages: 4,
    flags: {},
    reputation: { townGuard: 0, underworld: 0, scholars: 0 },
    discoveredClues: [],
    storyBeat: 'EXPLORATION', // EXPLORATION | COMBAT | PUZZLE | SOCIAL | BOSS | RESOLUTION
    turnsSinceBanter: 0,
    turnsSinceCombat: 0
  };
}

export function advanceWorldState(currentState = {}, dmResponse = {}) {
  const state = { ...currentState };

  // Update flags if set by DM
  if (Array.isArray(dmResponse.flagsSet)) {
    state.flags = { ...state.flags };
    dmResponse.flagsSet.forEach((flag) => {
      state.flags[flag] = true;
    });
  }

  // Update story beat
  if (dmResponse.storyBeat) {
    state.storyBeat = dmResponse.storyBeat;
  }

  // Track combat turns
  if (state.storyBeat === 'COMBAT') {
    state.turnsSinceCombat = 0;
  } else {
    state.turnsSinceCombat = (state.turnsSinceCombat || 0) + 1;
  }

  // Increment turns since companion banter
  const hasBanter = Boolean(
    dmResponse.companionActions &&
    dmResponse.companionActions.some(ca => ca.dialogue)
  );
  if (hasBanter) {
    state.turnsSinceBanter = 0;
  } else {
    state.turnsSinceBanter = (state.turnsSinceBanter || 0) + 1;
  }

  // Pacing progression check: advance quest stage every 2-3 significant narrative turns or on key flags
  if (state.flags?.['boss_defeated'] || state.flags?.['objective_secured']) {
    state.questStage = Math.max(state.questStage, 4);
  } else if (state.flags?.['boss_encountered'] || state.storyBeat === 'BOSS') {
    state.questStage = Math.max(state.questStage, 3);
  } else if (state.flags?.['obstacle_cleared'] || state.flags?.['door_opened'] || state.turnsSinceCombat >= 2) {
    if (state.questStage < 3) {
      state.questStage += 1;
    }
  }

  return state;
}
