import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateInventoryWeight,
  calculateCarryCapacity,
  processLootEvent,
  getItemDefinition,
} from "../lib/engine/inventory";
import { LootEvent } from "../lib/ai/schemas";

test("Inventory: Carry weight calculation and encumbrance", () => {
  const inventory = ["longsword", "chain_mail", "shield", "potion_of_healing"];
  // longsword (3) + chain_mail (55) + shield (6) + potion_of_healing (0.5) = 64.5 lbs
  const totalWeight = calculateInventoryWeight(inventory);
  assert.equal(totalWeight, 64.5);

  const str16 = calculateCarryCapacity(16);
  // Max capacity = 16 * 15 = 240 lbs
  // Encumbered threshold = 16 * 5 = 80 lbs
  assert.equal(str16.maxLbs, 240);
  assert.equal(str16.encumberedLbs, 80);

  const status16 = str16.checkStatus(totalWeight);
  assert.equal(status16.isEncumbered, false);
  assert.equal(status16.isOverCapacity, false);

  // For a weak wizard with STR 8:
  // Encumbered threshold = 8 * 5 = 40 lbs
  const str8 = calculateCarryCapacity(8);
  const status8 = str8.checkStatus(totalWeight);
  assert.equal(status8.isEncumbered, true);
  assert.equal(status8.isOverCapacity, false);
});

test("Inventory: Loot event processing - Grant & Remove items", () => {
  const initialInv = ["longsword", "shield"];
  const grantEvent: LootEvent = {
    type: "grant_item",
    itemId: "potion_of_healing",
    qty: 2,
    reason: "Chest in sunken crypt",
  };

  const res1 = processLootEvent(initialInv, 50, grantEvent);
  assert.equal(res1.newInventory.length, 4);
  assert.equal(res1.newInventory.filter((i) => i === "potion_of_healing").length, 2);
  assert.ok(res1.logText.includes("Potion of Healing"));

  const removeEvent: LootEvent = {
    type: "remove_item",
    itemId: "potion_of_healing",
    qty: 1,
    reason: "Consumed during rest",
  };

  const res2 = processLootEvent(res1.newInventory, 50, removeEvent);
  assert.equal(res2.newInventory.length, 3);
  assert.equal(res2.newInventory.filter((i) => i === "potion_of_healing").length, 1);
  assert.ok(res2.logText.includes("Removed 1x Potion of Healing"));
});

test("Inventory: Loot event processing - Grant & Spend gold", () => {
  const grantGold: LootEvent = {
    type: "grant_gold",
    gp: 150,
    reason: "Bounty for Wight Lord",
  };

  const res1 = processLootEvent([], 50, grantGold);
  assert.equal(res1.newGold, 200);
  assert.ok(res1.logText.includes("150 gold pieces"));

  const spendGold: LootEvent = {
    type: "spend_gold",
    gp: 75,
    reason: "Bought chain mail",
  };

  const res2 = processLootEvent([], res1.newGold, spendGold);
  assert.equal(res2.newGold, 125);
  assert.ok(res2.logText.includes("Spent 75 gold pieces"));
});
