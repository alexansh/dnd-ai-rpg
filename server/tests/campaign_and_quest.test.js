import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  startQuest,
  advanceQuestObjective,
  failQuest
} from '../services/questEngine.js';
import {
  evaluatePacing,
  evaluateActTransition,
  buildDirectorGuidance
} from '../services/storyDirector.js';
import { createInitialWorldState } from '../services/worldEngine.js';

describe('Phase 6: Campaign Library, Quest Engine & Story Director', () => {
  const sampleQuestTemplate = {
    id: 'quest_deserter_trail',
    title: 'The Hunt for Private Kenneth',
    description: 'Track the wounded deserter across the fog-drenched crossroads.',
    act: 1,
    objectives: [
      { id: 'find_tracks', text: 'Locate muddy bootprints near the gibbet', optional: false },
      { id: 'confront_deserter', text: 'Confront Kenneth at the abandoned mill', optional: false },
      { id: 'recover_dispatch', text: 'Retrieve the stolen covenant dispatch', optional: true }
    ],
    rewards: { gold: 75, xp: 150, items: ['Covenant Signet Ring'] },
    consequences: {
      worldFlags: { kenneth_case_resolved: true },
      factionDeltas: { iron_covenant: 15 }
    }
  };

  test('startQuest: creates and activates quest in state', () => {
    let questState = { active: [], completed: [], failed: [] };
    questState = startQuest(questState, sampleQuestTemplate);

    assert.strictEqual(questState.active.length, 1);
    assert.strictEqual(questState.active[0].id, 'quest_deserter_trail');
    assert.strictEqual(questState.active[0].status, 'active');
    assert.strictEqual(questState.active[0].objectives.length, 3);
  });

  test('advanceQuestObjective: tracks multi-stage objectives and triggers completion consequences', () => {
    let questState = startQuest({ active: [], completed: [], failed: [] }, sampleQuestTemplate);
    let worldState = createInitialWorldState();

    // 1. Advance first objective
    let res = advanceQuestObjective(questState, 'quest_deserter_trail', 'find_tracks', worldState);
    assert.strictEqual(res.questCompleted, false);
    assert.strictEqual(res.questState.active[0].objectives[0].completed, true);
    assert.strictEqual(res.questState.active[0].objectives[1].completed, false);

    // 2. Advance second required objective -> should complete the quest!
    res = advanceQuestObjective(res.questState, 'quest_deserter_trail', 'confront_deserter', res.worldState);
    assert.strictEqual(res.questCompleted, true);
    assert.strictEqual(res.questState.active.length, 0);
    assert.strictEqual(res.questState.completed.length, 1);
    assert.strictEqual(res.questState.completed[0].id, 'quest_deserter_trail');

    // Verify consequences applied to world state
    assert.strictEqual(res.worldState.flags.kenneth_case_resolved, true);
    assert.strictEqual(res.worldState.factionReputations.iron_covenant, 15);
  });

  test('failQuest: moves active quest to failed list with reason', () => {
    let questState = startQuest({ active: [], completed: [], failed: [] }, sampleQuestTemplate);
    questState = failQuest(questState, 'quest_deserter_trail', 'Kenneth perished in the swamp.');

    assert.strictEqual(questState.active.length, 0);
    assert.strictEqual(questState.failed.length, 1);
    assert.strictEqual(questState.failed[0].failureReason, 'Kenneth perished in the swamp.');
  });

  test('evaluatePacing: determines tone and urgency from turn count and act', () => {
    const pacingEarly = evaluatePacing({ act: 1, chapter: 1, turnCount: 2, completedEncounters: 0 });
    assert.strictEqual(pacingEarly.urgency, 1);
    assert.strictEqual(pacingEarly.recommendedScene, 'exploration');

    const pacingMid = evaluatePacing({ act: 1, chapter: 1, turnCount: 12, completedEncounters: 2 });
    assert.strictEqual(pacingMid.urgency, 3);
    assert.strictEqual(pacingMid.recommendedScene, 'moral_choice');

    const pacingClimax = evaluatePacing({ act: 3, chapter: 3, turnCount: 25, completedEncounters: 3 });
    assert.strictEqual(pacingClimax.urgency, 5);
    assert.strictEqual(pacingClimax.recommendedScene, 'boss_battle');
  });

  test('evaluateActTransition: progresses narrative acts at major story milestones', () => {
    const campaign = {
      acts: [
        { act: 1, name: 'Act I: The Ruptured Crypt Gate' },
        { act: 2, name: 'Act II: The Defiled Blood Altar' },
        { act: 3, name: 'Act III: The Lich King\'s Throne' }
      ]
    };

    // Before completing quest
    const preTransition = evaluateActTransition(campaign, 1, []);
    assert.strictEqual(preTransition.transitionOccurred, false);
    assert.strictEqual(preTransition.currentAct, 1);

    // Completing Act 1 quest triggers Act 2
    const postTransition = evaluateActTransition(campaign, 1, ['quest_deserter_trail']);
    assert.strictEqual(postTransition.transitionOccurred, true);
    assert.strictEqual(postTransition.newAct, 2);
    assert.ok(postTransition.transitionNarration.includes('Act II'));
  });

  test('buildDirectorGuidance: generates structured anti-spoiler guidance for DM', () => {
    const guidance = buildDirectorGuidance({
      campaign: { mainNemesis: 'Lord Morvath' },
      currentAct: 1,
      turnCount: 5,
      worldState: { flags: { camp_established: true } }
    });

    assert.strictEqual(guidance.currentAct, 1);
    assert.strictEqual(guidance.nemesisFocus, 'Lord Morvath');
    assert.ok(Array.isArray(guidance.prohibitedDisclosures));
    assert.ok(guidance.prohibitedDisclosures.length >= 2);
  });
});
