import { eventBus, EVENTS } from './eventBus.js';
import { getNpcsAtLocation } from './npcSimulation.js';

/**
 * 🌍 Persistent World Simulation Engine
 * Manages day/time cycle, dynamic weather, faction relations, and interactive world entities.
 */

const TIME_CYCLE = ['morning', 'afternoon', 'evening', 'night'];
const WEATHER_TYPES = ['clear', 'fog', 'light_rain', 'thunderstorm', 'chilly_overcast'];

export const DEFAULT_INTERACTIVE_OBJECTS = {
  'cellar_heavy_chest': {
    id: 'cellar_heavy_chest',
    name: 'Reinforced Oak Chest with Runic Lock',
    type: 'chest',
    state: 'locked',
    lockDc: 13,
    breakDc: 16,
    loot: [
      { id: 'item_sun_relic', name: 'Sunstone Amulet', type: 'Relic', value: 45 },
      { id: 'gold_pouch', name: 'Velvet Coin Pouch', type: 'Currency', value: 30 }
    ]
  },
  'crossroads_gibbet_cage': {
    id: 'crossroads_gibbet_cage',
    name: 'Rusted Iron Hanging Cage',
    type: 'cage',
    state: 'locked',
    lockDc: 12,
    breakDc: 15,
    loot: [
      { id: 'item_covenant_seal', name: 'Iron Covenant Dispatch', type: 'Document', value: 20 }
    ]
  },
  'crypt_sunken_sarcophagus': {
    id: 'crypt_sunken_sarcophagus',
    name: 'Sarcophagus of High Lord Oros',
    type: 'sarcophagus',
    state: 'sealed',
    lockDc: 15,
    breakDc: 18,
    loot: [
      { id: 'item_crown_ember', name: 'Crown of the Ash Sovereign', type: 'Artifact', value: 250 }
    ]
  }
};

/**
 * Initializes default world state structure
 */
export function createInitialWorldState() {
  return {
    day: 1,
    time: 'morning',
    weather: 'clear',
    currentLocation: 'The Wayward Flagon Tavern',
    flags: {
      intro_completed: true,
      deserter_spared: null,
      crypt_discovered: false
    },
    factionReputations: {
      civilians: 10,
      iron_covenant: 0,
      shadow_syndicate: 0,
      arcanists: 5
    },
    interactiveObjects: JSON.parse(JSON.stringify(DEFAULT_INTERACTIVE_OBJECTS))
  };
}

/**
 * Advances world time and updates cycles
 */
export function advanceWorldTime(worldState, stepCount = 1) {
  const currentIdx = TIME_CYCLE.indexOf(worldState.time || 'morning');
  const nextIdx = (currentIdx + stepCount) % TIME_CYCLE.length;
  const daysToAdd = Math.floor((currentIdx + stepCount) / TIME_CYCLE.length);

  const newDay = (worldState.day || 1) + daysToAdd;
  const newTime = TIME_CYCLE[nextIdx];

  // Weather simulation: 35% chance to shift weather
  let newWeather = worldState.weather || 'clear';
  if (Math.random() < 0.35) {
    const randomWeather = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
    if (randomWeather !== newWeather) {
      newWeather = randomWeather;
      eventBus.emitGameEvent(EVENTS.WEATHER_CHANGED, { weather: newWeather, day: newDay, time: newTime });
    }
  }

  const updatedState = {
    ...worldState,
    day: newDay,
    time: newTime,
    weather: newWeather
  };

  eventBus.emitGameEvent(EVENTS.TIME_ADVANCED, { day: newDay, time: newTime });
  return updatedState;
}

/**
 * Resolves player interaction with an interactive world entity (chest, door, lever)
 */
export function interactWithWorldObject({ worldState, objectId, action = 'inspect', diceResult = 0 }) {
  const objects = worldState.interactiveObjects || DEFAULT_INTERACTIVE_OBJECTS;
  const target = objects[objectId];

  if (!target) {
    return { success: false, message: 'Object not found in world state' };
  }

  let lootAcquired = [];
  let newState = target.state;
  let message = '';
  let success = false;

  switch (action) {
    case 'inspect':
      message = `${target.name} is currently ${target.state}.`;
      success = true;
      break;

    case 'pick_lock':
      if (target.state !== 'locked' && target.state !== 'sealed') {
        message = `${target.name} is already ${target.state}.`;
        success = true;
      } else if (diceResult >= (target.lockDc || 12)) {
        newState = 'unlocked';
        message = `Click! The intricate lock mechanism clicks open.`;
        success = true;
      } else {
        message = `The tumblers resist your lockpicks (DC ${target.lockDc}).`;
        success = false;
      }
      break;

    case 'force_open':
      if (target.state !== 'locked' && target.state !== 'sealed') {
        message = `${target.name} is already ${target.state}.`;
        success = true;
      } else if (diceResult >= (target.breakDc || 15)) {
        newState = 'broken_open';
        message = `With a mighty surge of strength, the latch shatters!`;
        success = true;
      } else {
        message = `The reinforced hinges hold firm against your force (DC ${target.breakDc}).`;
        success = false;
      }
      break;

    case 'loot':
    case 'open':
      if (target.state === 'locked' || target.state === 'sealed') {
        message = `${target.name} is locked shut. You must unlock or force it first.`;
        success = false;
      } else if (target.state === 'looted') {
        message = `${target.name} is completely empty.`;
        success = true;
      } else {
        newState = 'looted';
        lootAcquired = target.loot || [];
        message = `You open ${target.name} and recover: ${lootAcquired.map(i => i.name).join(', ')}.`;
        success = true;
      }
      break;

    default:
      message = `Cannot perform action "${action}" on ${target.name}.`;
      success = false;
  }

  const updatedObjects = {
    ...objects,
    [objectId]: {
      ...target,
      state: newState
    }
  };

  eventBus.emitGameEvent(EVENTS.OBJECT_INTERACTED, {
    objectId,
    action,
    success,
    newState,
    lootAcquired
  });

  return {
    success,
    message,
    newState,
    lootAcquired,
    updatedWorldState: {
      ...worldState,
      interactiveObjects: updatedObjects
    }
  };
}

/**
 * Modifies faction reputation and bounds between -100 and +100
 */
export function modifyFactionReputation(worldState, factionId, delta = 0, reason = '') {
  const current = worldState.factionReputations?.[factionId] ?? 0;
  const updated = Math.max(-100, Math.min(100, current + delta));

  const updatedState = {
    ...worldState,
    factionReputations: {
      ...(worldState.factionReputations || {}),
      [factionId]: updated
    }
  };

  eventBus.emitGameEvent(EVENTS.WORLD_FLAG_CHANGED, {
    factionId,
    previous: current,
    current: updated,
    reason
  });

  return updatedState;
}
