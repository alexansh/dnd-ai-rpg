/**
 * Story Guardrails & Anti-Derail Constraint Generator
 * Injects authored guardrails to prevent hallucinations, dead-ends, and derailment.
 */

export function buildStoryConstraints(worldState = {}, quest = null) {
  const stage = worldState.questStage || 1;
  const totalStages = worldState.totalStages || 4;
  const flags = Object.keys(worldState.flags || {}).filter(k => worldState.flags[k]);
  const activeFlagsStr = flags.length > 0 ? flags.join(', ') : 'None yet';

  let stageGuidance = '';
  if (stage === 1) {
    stageGuidance = 'Stage 1 (Infiltration & Entrance): Establish atmosphere, present first tactical choice or hazard. Do NOT introduce final objective/boss yet.';
  } else if (stage === 2) {
    stageGuidance = 'Stage 2 (Mid-Dungeon / Complication): Escalate danger, reveal clues, puzzles, or skirmishes. Player faces tests of skill.';
  } else if (stage === 3) {
    stageGuidance = 'Stage 3 (Climax / Boss Encounter): The primary adversary or central peril is confronted. Stakes are at their peak.';
  } else {
    stageGuidance = 'Stage 4 (Resolution & Loot): Victory is achieved or quest objective secured. Offer path back to The Wayward Flagon.';
  }

  return `
STORY CONSTRAINTS (MANDATORY DM RULES):
- Quest Progression: Stage ${stage} of ${totalStages}. ${stageGuidance}
- Active World Flags: [${activeFlagsStr}]. Stay consistent with these established facts.
- FAIL FORWARD PRINCIPLE: If a player check fails, the story MUST STILL ADVANCE. Never dead-end the narrative. Failed checks cause complications (e.g. traps sprung, alarms sounded, HP damage, lost time) but NEVER block progress completely.
- ANTI-DERAILMENT: If the player attempts actions that break world logic or wander away from the active quest area, gracefully redirect them within the fiction. (e.g., "The ancient arcane wards deflect the blast harmlessly, but the blinding flare reveals an unmapped archway...").
- COMPANION PACING: Companions act tactically according to their role. Companions speak dialogue sparingly (at most once every 2-3 turns) on dramatic beats.
- ZERO PLAYER INSTA-KILL: Do NOT eliminate the player outright. If player reaches 0 HP, companions intervene to stabilize them, or enemies take them captive — the adventure continues.
`;
}
