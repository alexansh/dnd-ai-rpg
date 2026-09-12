import { EventEmitter } from 'events';

/**
 * 📢 Central System Event Bus
 * Decouples game systems (NPC simulation, Quest Engine, Companion reactions, Audio).
 */

export const EVENTS = {
  PLAYER_ENTER_LOCATION: 'PLAYER_ENTER_LOCATION',
  PLAYER_LEAVE_LOCATION: 'PLAYER_LEAVE_LOCATION',
  COMBAT_STARTED: 'COMBAT_STARTED',
  COMBAT_ENDED: 'COMBAT_ENDED',
  NPC_MET: 'NPC_MET',
  NPC_DIED: 'NPC_DIED',
  ITEM_ACQUIRED: 'ITEM_ACQUIRED',
  ITEM_USED: 'ITEM_USED',
  QUEST_STARTED: 'QUEST_STARTED',
  QUEST_OBJECTIVE_COMPLETED: 'QUEST_OBJECTIVE_COMPLETED',
  QUEST_COMPLETED: 'QUEST_COMPLETED',
  QUEST_FAILED: 'QUEST_FAILED',
  COMPANION_APPROVAL_CHANGED: 'COMPANION_APPROVAL_CHANGED',
  WORLD_FLAG_CHANGED: 'WORLD_FLAG_CHANGED',
  TIME_ADVANCED: 'TIME_ADVANCED',
  WEATHER_CHANGED: 'WEATHER_CHANGED',
  OBJECT_INTERACTED: 'OBJECT_INTERACTED'
};

class GameEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    this._recentEvents = [];
  }

  emitGameEvent(eventType, payload = {}) {
    const eventRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: eventType,
      payload,
      timestamp: new Date().toISOString()
    };

    this._recentEvents = [eventRecord, ...this._recentEvents].slice(0, 50);
    this.emit(eventType, eventRecord);
    this.emit('*', eventRecord);
    return eventRecord;
  }

  getRecentEvents(limit = 10) {
    return this._recentEvents.slice(0, limit);
  }

  clearHistory() {
    this._recentEvents = [];
  }
}

export const eventBus = new GameEventBus();
