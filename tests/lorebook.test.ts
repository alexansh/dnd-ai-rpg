import test from "node:test";
import assert from "node:assert";
import { scanLorebook, LoreEntry } from "../lib/services/memory/lorebook";
import { formatAuthorNotePrompt, AuthorNote } from "../lib/services/memory/authorNote";
import { formatSessionSummaryPrompt } from "../lib/services/memory/sessionSummary";

test("Memory Engine: Lorebook Scanning & Token Budget", async (t) => {
  const mockEntries: LoreEntry[] = [
    {
      id: "rule_1",
      keys: ["rule"],
      content: "Core world rule: magic requires spell slots.",
      priority: 100,
      alwaysActive: true,
      category: "world-rule",
    },
    {
      id: "npc_wight",
      keys: ["wight", "malakor"],
      content: "Lord Malakor wields a necrotic blade.",
      priority: 80,
      category: "npc",
    },
    {
      id: "npc_thief_secret",
      keys: ["aldous"],
      secondaryKeys: ["key", "passage"],
      content: "Aldous knows the secret latch beneath the third flagstone.",
      priority: 95,
      category: "npc",
    },
    {
      id: "loc_catacombs",
      keys: ["catacombs"],
      content: "The catacombs extend 400 paces north.",
      priority: 40,
      category: "location",
    },
  ];

  await t.test("alwaysActive entries are matched regardless of textBuffer", () => {
    const { matchedEntries } = scanLorebook("hello world", mockEntries, 500);
    assert.strictEqual(matchedEntries.length, 1);
    assert.strictEqual(matchedEntries[0].id, "rule_1");
  });

  await t.test("primary keys trigger matched entries", () => {
    const { matchedEntries } = scanLorebook("We approach the wight lord", mockEntries, 500);
    assert.ok(matchedEntries.some((e) => e.id === "npc_wight"));
    assert.ok(matchedEntries.some((e) => e.id === "rule_1"));
  });

  await t.test("secondaryKeys require both primary AND secondary match", () => {
    // Only primary 'aldous', missing 'key' or 'passage' -> should NOT match
    const failScan = scanLorebook("We speak with Aldous in the cell", mockEntries, 500);
    assert.ok(!failScan.matchedEntries.some((e) => e.id === "npc_thief_secret"));

    // Primary 'aldous' AND secondary 'passage' -> should match
    const passScan = scanLorebook("We ask Aldous about the secret passage", mockEntries, 500);
    assert.ok(passScan.matchedEntries.some((e) => e.id === "npc_thief_secret"));
  });

  await t.test("token budget truncates lower priority entries", () => {
    // Very tight budget (only 15 tokens)
    const { matchedEntries, tokensUsed } = scanLorebook("catacombs wight", mockEntries, 15);
    assert.ok(tokensUsed <= 15);
    // rule_1 (alwaysActive) should be included first
    assert.ok(matchedEntries.some((e) => e.id === "rule_1"));
  });
});

test("Memory Engine: Author Note & Session Summary", async (t) => {
  await t.test("formats author note correctly", () => {
    const note: AuthorNote = {
      text: "Tone: gritty. Pacing: fast.",
      tone: "Gritty",
      pacing: "Fast",
      active: true,
    };
    const formatted = formatAuthorNotePrompt(note);
    assert.strictEqual(formatted, "[Author's Note / Tone Directive: Tone: gritty. Pacing: fast.]");
  });

  await t.test("formats session summary bullet points", () => {
    const formatted = formatSessionSummaryPrompt();
    assert.ok(formatted.includes("Chronicle Facts & Prior Milestones:"));
    assert.ok(formatted.includes("Sunken Crypt"));
  });
});
