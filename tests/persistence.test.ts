import test, { describe } from "node:test";
import assert from "node:assert";
import { SavesDatabase } from "../lib/db/database";
import { CharacterSaveSlot } from "../lib/state/useGameStore";

describe("SQLite Server-Side Campaign Persistence", () => {
  const testSlot: CharacterSaveSlot = {
    id: "char_thorin_oakenshield",
    player: {
      name: "Thorin Oakenshield",
      race: "Dwarf",
      className: "Fighter",
      level: 3,
      exp: 900,
      abilities: { str: 16, dex: 12, con: 16, int: 10, wis: 12, cha: 8 },
      maxHp: 28,
      currentHp: 24,
      tempHp: 0,
      armorClass: 16,
      speed: 25,
      initiativeModifier: 1,
      spellSlotsLevel1: 0,
      maxSpellSlotsLevel1: 0,
      inventory: ["battleaxe", "chain_mail", "healing_potion"],
      equippedWeapon: "battleaxe",
      equippedArmor: "chain_mail",
      gold: 55,
      inspiration: true,
      deathSaves: { successes: 0, failures: 0, isStabilized: false, isDead: false, history: [] },
      portrait: "/portraits/dwarf_fighter.png",
      conditions: [],
    },
    currentAct: 2,
    currentLocation: "Flooded Crypt of the Forgotten King",
    currentObjective: "Slay the Wight Lord and reclaim the Sunken Crown",
    ambiance: "crypt_solemn",
    logs: [
      {
        id: "log_1",
        role: "dm",
        text: "Water laps at your greaves as the iron gate groans shut behind you.",
        timestamp: "12:00 PM",
      },
    ],
    createdAt: "2026-09-13T10:00:00.000Z",
    lastPlayed: "2026-09-13T12:00:00.000Z",
  };

  test("initializes in-memory database and handles full CRUD lifecycle", () => {
    const db = new SavesDatabase(":memory:");

    // 1. Initial should be empty
    assert.strictEqual(db.getAllSaves().length, 0);
    assert.strictEqual(db.getSaveById("char_thorin_oakenshield"), null);

    // 2. Upsert
    db.upsertSave(testSlot);

    // 3. Query all
    const allSaves = db.getAllSaves();
    assert.strictEqual(allSaves.length, 1);
    assert.strictEqual(allSaves[0].player.name, "Thorin Oakenshield");
    assert.strictEqual(allSaves[0].player.abilities.str, 16);
    assert.strictEqual(allSaves[0].currentAct, 2);

    // 4. Query by ID
    const fetched = db.getSaveById("char_thorin_oakenshield");
    assert.notStrictEqual(fetched, null);
    assert.strictEqual(fetched?.player.className, "Fighter");
    assert.strictEqual(fetched?.logs.length, 1);
    assert.strictEqual(fetched?.ambiance, "crypt_solemn");

    // 5. Update state (e.g. Act 3, lower HP)
    const updatedSlot: CharacterSaveSlot = {
      ...testSlot,
      currentAct: 3,
      player: {
        ...testSlot.player,
        currentHp: 12,
      },
      lastPlayed: "2026-09-13T12:30:00.000Z",
    };
    db.upsertSave(updatedSlot);

    const updated = db.getSaveById("char_thorin_oakenshield");
    assert.strictEqual(updated?.currentAct, 3);
    assert.strictEqual(updated?.player.currentHp, 12);
    assert.strictEqual(db.getAllSaves().length, 1);

    // 6. Delete save
    const deleted = db.deleteSave("char_thorin_oakenshield");
    assert.strictEqual(deleted, true);
    assert.strictEqual(db.getAllSaves().length, 0);
    assert.strictEqual(db.getSaveById("char_thorin_oakenshield"), null);

    // 7. Delete non-existent
    const deleteAgain = db.deleteSave("non_existent_id");
    assert.strictEqual(deleteAgain, false);

    db.close();
  });
});
