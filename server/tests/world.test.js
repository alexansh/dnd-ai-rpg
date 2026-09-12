import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  createInitialWorldState,
  advanceWorldTime,
  interactWithWorldObject,
  modifyFactionReputation
} from '../services/worldEngine.js';
import {
  getNpc,
  getNpcLocation,
  getNpcsAtLocation,
  recordNpcMemory,
  queryNpcKnowledge
} from '../services/npcSimulation.js';
import { eventBus, EVENTS } from '../services/eventBus.js';

describe('Phase 4: Persistent World Engine & NPC Simulation', () => {
  test('createInitialWorldState: initializes valid world state', () => {
    const world = createInitialWorldState();
    assert.strictEqual(world.day, 1);
    assert.strictEqual(world.time, 'morning');
    assert.ok(world.interactiveObjects['cellar_heavy_chest']);
    assert.strictEqual(world.interactiveObjects['cellar_heavy_chest'].state, 'locked');
  });

  test('advanceWorldTime: cycles through time of day and increments day count', () => {
    let world = createInitialWorldState();
    assert.strictEqual(world.time, 'morning');

    world = advanceWorldTime(world, 1);
    assert.strictEqual(world.time, 'afternoon');
    assert.strictEqual(world.day, 1);

    world = advanceWorldTime(world, 1);
    assert.strictEqual(world.time, 'evening');

    world = advanceWorldTime(world, 1);
    assert.strictEqual(world.time, 'night');

    world = advanceWorldTime(world, 1);
    assert.strictEqual(world.time, 'morning');
    assert.strictEqual(world.day, 2, 'Day must increment after cycling past night');
  });

  test('interactWithWorldObject: validates lock DC, unlocks, and dispenses loot', () => {
    let world = createInitialWorldState();
    const chestId = 'cellar_heavy_chest';

    // 1. Fail to pick lock with low roll (DC is 13)
    const failAttempt = interactWithWorldObject({
      worldState: world,
      objectId: chestId,
      action: 'pick_lock',
      diceResult: 10
    });
    assert.strictEqual(failAttempt.success, false);
    assert.strictEqual(failAttempt.newState, 'locked');

    // 2. Succeed with high roll (15 >= 13)
    const successAttempt = interactWithWorldObject({
      worldState: failAttempt.updatedWorldState || world,
      objectId: chestId,
      action: 'pick_lock',
      diceResult: 15
    });
    assert.strictEqual(successAttempt.success, true);
    assert.strictEqual(successAttempt.newState, 'unlocked');

    // 3. Loot the unlocked chest
    const lootAttempt = interactWithWorldObject({
      worldState: successAttempt.updatedWorldState,
      objectId: chestId,
      action: 'loot'
    });
    assert.strictEqual(lootAttempt.success, true);
    assert.strictEqual(lootAttempt.newState, 'looted');
    assert.ok(lootAttempt.lootAcquired.length >= 1, 'Must acquire loot from chest');
    assert.strictEqual(lootAttempt.lootAcquired[0].name, 'Sunstone Amulet');

    // 4. Repeated loot returns empty
    const emptyAttempt = interactWithWorldObject({
      worldState: lootAttempt.updatedWorldState,
      objectId: chestId,
      action: 'loot'
    });
    assert.strictEqual(emptyAttempt.success, true);
    assert.strictEqual(emptyAttempt.lootAcquired.length, 0);
  });

  test('modifyFactionReputation: updates and clamps within [-100, 100]', () => {
    let world = createInitialWorldState();
    world = modifyFactionReputation(world, 'iron_covenant', 25, 'Helped Covenant soldier');
    assert.strictEqual(world.factionReputations.iron_covenant, 25);

    world = modifyFactionReputation(world, 'iron_covenant', 150, 'Extreme heroics');
    assert.strictEqual(world.factionReputations.iron_covenant, 100, 'Must clamp at 100');

    world = modifyFactionReputation(world, 'iron_covenant', -250, 'Betrayed covenant');
    assert.strictEqual(world.factionReputations.iron_covenant, -100, 'Must clamp at -100');
  });

  test('npcSimulation: respects schedules and tracks episodic memories', () => {
    const barnaby = getNpc('barnaby');
    assert.ok(barnaby);
    assert.strictEqual(barnaby.name, 'Barnaby Stonebeard');

    // Check schedule
    const morningLoc = getNpcLocation('barnaby', 'morning');
    const eveningLoc = getNpcLocation('barnaby', 'evening');
    assert.strictEqual(morningLoc, 'tavern_cellar');
    assert.strictEqual(eveningLoc, 'tavern_taproom');

    // Record episodic memory
    const memory = recordNpcMemory('barnaby', {
      event: 'Player shared a round of spiced cider with Barnaby and tipped 5 gold',
      importance: 0.8,
      location: 'tavern_taproom',
      participants: ['Barnaby', 'Player']
    });
    assert.ok(memory.id);

    const reloaded = getNpc('barnaby');
    assert.strictEqual(reloaded.memories[0].event, memory.event);

    // Query knowledge boundary
    const knowledge = queryNpcKnowledge('barnaby', 'whispering_crossroads');
    assert.ok(knowledge.length >= 1);
    assert.ok(knowledge[0].fact.includes('Goblins'));
  });

  test('eventBus: records and emits game events', () => {
    eventBus.clearHistory();
    eventBus.emitGameEvent(EVENTS.PLAYER_ENTER_LOCATION, { location: 'The Sunken Sepulcher' });
    const recents = eventBus.getRecentEvents(5);
    assert.strictEqual(recents.length, 1);
    assert.strictEqual(recents[0].type, EVENTS.PLAYER_ENTER_LOCATION);
    assert.strictEqual(recents[0].payload.location, 'The Sunken Sepulcher');
  });
});
