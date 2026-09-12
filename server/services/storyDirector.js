import { eventBus, EVENTS } from './eventBus.js';

/**
 * 🎬 Story Director Service
 * Oversees high-level narrative pacing, three-act campaign progression, and anti-spoiler guardrails.
 */

export function evaluatePacing({ act = 1, chapter = 1, turnCount = 0, completedEncounters = 0 }) {
  // Pacing heuristic: 1 (Lull / Exploration) to 5 (Climax)
  if (act === 3 && completedEncounters >= 2) return { urgency: 5, tone: 'Climactic confrontation', recommendedScene: 'boss_battle' };
  if (completedEncounters === 0 && turnCount < 4) return { urgency: 1, tone: 'Atmospheric arrival & setup', recommendedScene: 'exploration' };
  if (turnCount >= 4 && turnCount < 10) return { urgency: 2, tone: 'Rising tension and initial challenges', recommendedScene: 'minor_encounter' };
  if (turnCount >= 10 && turnCount < 18) return { urgency: 3, tone: 'High stakes and moral dilemmas', recommendedScene: 'moral_choice' };
  return { urgency: 4, tone: 'Impending crisis', recommendedScene: 'escalating_threat' };
}

export function evaluateActTransition(campaign, currentAct = 1, completedQuestIds = []) {
  const acts = campaign?.acts || [
    { act: 1, name: 'Act I: Arrival & Discovery' },
    { act: 2, name: 'Act II: The Deepening Peril' },
    { act: 3, name: 'Act III: Final Confrontation' }
  ];

  if (currentAct === 1 && completedQuestIds.length >= 1) {
    return {
      transitionOccurred: true,
      previousAct: 1,
      newAct: 2,
      actData: acts[1] || acts[0],
      transitionNarration: `⚡ **Act II Begins**: The initial skirmishes are over. The true scale of the ancient threat becomes undeniable.`
    };
  }

  if (currentAct === 2 && completedQuestIds.length >= 2) {
    return {
      transitionOccurred: true,
      previousAct: 2,
      newAct: 3,
      actData: acts[2] || acts[1],
      transitionNarration: `🔥 **Act III: The Climax**: The final hour has arrived. There is no turning back as the party marches into the nemesis's sanctum.`
    };
  }

  return {
    transitionOccurred: false,
    currentAct,
    actData: acts[currentAct - 1] || acts[0]
  };
}

export function buildDirectorGuidance({ campaign, currentAct = 1, turnCount = 0, worldState = {} }) {
  const pacing = evaluatePacing({ act: currentAct, turnCount, completedEncounters: Object.keys(worldState.flags || {}).length });
  
  return {
    currentAct,
    urgencyLevel: pacing.urgency,
    tone: pacing.tone,
    recommendedSceneType: pacing.recommendedScene,
    nemesisFocus: campaign?.mainNemesis || 'Unknown Shadow',
    prohibitedDisclosures: [
      'Do not reveal the final boss identity before Act III.',
      'Do not reveal the secret relic mechanism before the puzzle is unlocked.',
      'Do not reveal companion personal quest resolutions prematurely.'
    ],
    pacingRule: 'Narrate in 2-4 vivid sentences, ending with a direct sensory hook or tactical choice.'
  };
}
