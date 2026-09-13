import test from "node:test";
import assert from "node:assert";
import { useGameStore, DEFAULT_SAVE_SLOT } from "../lib/state/useGameStore";

test("Character Save & Campaign Deletion Mechanics", async (t) => {
  await t.test("initial state contains default save slot", () => {
    const state = useGameStore.getState();
    assert.ok(state.characterSaves.length >= 1);
    assert.strictEqual(state.activeCharacterId, DEFAULT_SAVE_SLOT.id);
    assert.strictEqual(state.player?.name, "Kaelen Ashborne");
  });

  await t.test("can create and activate a new character save slot", () => {
    const store = useGameStore.getState();
    store.createAndActivateCharacter({
      name: "Valerius the Sorcerer",
      race: "High Elf",
      className: "Wizard",
      level: 1,
      maxHp: 8,
      currentHp: 8,
    });

    const stateAfter = useGameStore.getState();
    assert.strictEqual(stateAfter.characterSaves.length, 2);
    assert.strictEqual(stateAfter.player?.name, "Valerius the Sorcerer");
    assert.notStrictEqual(stateAfter.activeCharacterId, DEFAULT_SAVE_SLOT.id);
    assert.strictEqual(stateAfter.currentAct, 1);
  });

  await t.test("can switch between character save slots and preserve state", () => {
    const store = useGameStore.getState();
    store.switchCharacter(DEFAULT_SAVE_SLOT.id);

    const stateAfter = useGameStore.getState();
    assert.strictEqual(stateAfter.activeCharacterId, DEFAULT_SAVE_SLOT.id);
    assert.strictEqual(stateAfter.player?.name, "Kaelen Ashborne");
  });

  await t.test("can delete a specific character and their campaign", () => {
    const store = useGameStore.getState();
    // Delete Kaelen (active character)
    store.deleteCharacterAndCampaign(DEFAULT_SAVE_SLOT.id);

    const stateAfter = useGameStore.getState();
    // Should now only have 1 character (Valerius)
    assert.strictEqual(stateAfter.characterSaves.length, 1);
    assert.strictEqual(stateAfter.player?.name, "Valerius the Sorcerer");
    assert.ok(!stateAfter.characterSaves.some((c) => c.id === DEFAULT_SAVE_SLOT.id));
  });

  await t.test("deleting the last character completely purges the campaign", () => {
    const store = useGameStore.getState();
    const remainingId = store.characterSaves[0].id;

    store.deleteCharacterAndCampaign(remainingId);

    const stateAfter = useGameStore.getState();
    assert.strictEqual(stateAfter.characterSaves.length, 0);
    assert.strictEqual(stateAfter.activeCharacterId, null);
    assert.strictEqual(stateAfter.player, null);
    assert.strictEqual(stateAfter.logs.length, 0);
    assert.strictEqual(stateAfter.currentScreen, "title");
  });

  await t.test("can forge a fresh hero after total deletion", () => {
    const store = useGameStore.getState();
    store.createAndActivateCharacter({
      name: "Alden Stormbringer",
      race: "Mountain Dwarf",
      className: "Cleric",
      level: 1,
    });

    const stateAfter = useGameStore.getState();
    assert.strictEqual(stateAfter.characterSaves.length, 1);
    assert.strictEqual(stateAfter.player?.name, "Alden Stormbringer");
    assert.ok(stateAfter.activeCharacterId !== null);
    assert.ok(stateAfter.logs.length > 0);
  });
});
