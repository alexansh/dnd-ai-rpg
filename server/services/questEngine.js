import { eventBus, EVENTS } from './eventBus.js';
import { modifyFactionReputation } from './worldEngine.js';

/**
 * 📜 Quest Engine
 * Manages persistent multi-stage quests, hierarchical objectives, rewards, and downstream consequences.
 */

export function createQuestInstance(template) {
  return {
    id: template.id,
    campaignId: template.campaignId || 'generic',
    title: template.title,
    description: template.description,
    act: template.act || 1,
    chapter: template.chapter || 1,
    status: 'active', // 'available' | 'active' | 'completed' | 'failed'
    objectives: (template.objectives || []).map(obj => ({
      id: obj.id,
      text: obj.text,
      completed: false,
      optional: Boolean(obj.optional),
      hidden: Boolean(obj.hidden)
    })),
    rewards: template.rewards || { gold: 50, xp: 100, items: [] },
    consequences: template.consequences || { worldFlags: {}, factionDeltas: {} },
    startedAt: new Date().toISOString(),
    completedAt: null
  };
}

export function startQuest(questState = { active: [], completed: [], failed: [] }, template) {
  if (questState.active.some(q => q.id === template.id)) {
    return questState;
  }

  const newQuest = createQuestInstance(template);
  const updatedActive = [...questState.active, newQuest];

  eventBus.emitGameEvent(EVENTS.QUEST_STARTED, { questId: newQuest.id, title: newQuest.title });

  return {
    ...questState,
    active: updatedActive
  };
}

export function advanceQuestObjective(questState, questId, objectiveId, worldState = null) {
  const questIndex = questState.active.findIndex(q => q.id === questId);
  if (questIndex === -1) {
    return { questState, worldState, completed: false };
  }

  const quest = JSON.parse(JSON.stringify(questState.active[questIndex]));
  const obj = quest.objectives.find(o => o.id === objectiveId);
  if (obj) {
    obj.completed = true;
    eventBus.emitGameEvent(EVENTS.QUEST_OBJECTIVE_COMPLETED, {
      questId,
      objectiveId,
      objectiveText: obj.text
    });
  }

  // Check if all non-optional objectives are complete
  const allRequiredDone = quest.objectives
    .filter(o => !o.optional)
    .every(o => o.completed);

  let updatedActive = [...questState.active];
  let updatedCompleted = [...(questState.completed || [])];
  let updatedWorld = worldState ? { ...worldState } : null;

  if (allRequiredDone) {
    quest.status = 'completed';
    quest.completedAt = new Date().toISOString();
    updatedActive.splice(questIndex, 1);
    updatedCompleted.push(quest);

    // Apply consequences to worldState if provided
    if (updatedWorld) {
      if (quest.consequences.worldFlags) {
        updatedWorld.flags = {
          ...(updatedWorld.flags || {}),
          ...quest.consequences.worldFlags
        };
      }
      if (quest.consequences.factionDeltas) {
        for (const [faction, delta] of Object.entries(quest.consequences.factionDeltas)) {
          updatedWorld = modifyFactionReputation(updatedWorld, faction, delta, `Quest completion: ${quest.title}`);
        }
      }
    }

    eventBus.emitGameEvent(EVENTS.QUEST_COMPLETED, {
      questId: quest.id,
      title: quest.title,
      rewards: quest.rewards
    });
  } else {
    updatedActive[questIndex] = quest;
  }

  return {
    questState: {
      ...questState,
      active: updatedActive,
      completed: updatedCompleted
    },
    worldState: updatedWorld,
    questCompleted: allRequiredDone,
    quest
  };
}

export function failQuest(questState, questId, reason = '') {
  const questIndex = questState.active.findIndex(q => q.id === questId);
  if (questIndex === -1) return questState;

  const quest = { ...questState.active[questIndex], status: 'failed', failureReason: reason };
  const updatedActive = [...questState.active];
  updatedActive.splice(questIndex, 1);

  eventBus.emitGameEvent(EVENTS.QUEST_FAILED, { questId, reason });

  return {
    ...questState,
    active: updatedActive,
    failed: [...(questState.failed || []), quest]
  };
}
