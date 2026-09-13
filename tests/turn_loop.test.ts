import test, { describe } from "node:test";
import assert from "node:assert";
import { resolveEngineRequest } from "../lib/engine/resolver";
import { EngineRequest } from "../lib/engine/types";
import { scanLorebook } from "../lib/services/memory/lorebook";
import { formatAuthorNotePrompt, DEFAULT_AUTHOR_NOTE } from "../lib/services/memory/authorNote";
import { GameNarrativeStepSchema } from "../lib/ai/schemas";
import { initializeCombat, advanceTurn, applyDamageToCombatant, Combatant } from "../lib/engine/combat";
import { SRD_MONSTERS } from "../lib/srd/monsters";

describe("Full Turn Loop Integration Test (Player Action -> Engine Resolve -> DM -> State Update)", () => {
  test("Exploration Turn: submit action -> engine resolves DC -> DM step schema validated -> state updates", async () => {
    // 1. Player Submits Action
    const playerAction = "I force the waterlogged ironwood door open with all my might.";
    const currentLocation = "Drowned Ossuary";
    const questStep = "Breach the inner sanctum of the Sunken Crypt";

    // 2. Engine Resolves Deterministic Ability Check
    const engineRequest: EngineRequest = {
      type: "ability_check",
      ability: "str",
      skill: "Athletics",
      dc: 14,
      advantage: "normal",
      reason: "Force open the heavy door",
      abilityScore: 16,
      proficiencyBonus: 2,
      isProficient: true,
    };

    const rollResult = resolveEngineRequest(engineRequest);

    assert.ok(rollResult.total > 0, "Total must be positive");
    assert.strictEqual(typeof rollResult.success, "boolean");
    assert.ok(rollResult.breakdown.includes("vs DC 14"), "Breakdown includes DC target");

    // 3. Memory & Lore Context Assembly
    const loreScan = scanLorebook(`${currentLocation} ${questStep} ${playerAction}`);
    assert.ok(loreScan.matchedEntries.length > 0, "Lorebook matched world entries");
    const authorNoteText = formatAuthorNotePrompt(DEFAULT_AUTHOR_NOTE);
    assert.ok(authorNoteText.includes("Tone:"), "Author note is formatted");

    // 4. DM Narration Step Adheres to Structured Schema
    const dmResponsePayload = {
      narrative: rollResult.success
        ? "With a resounding groan of shearing rust and cracking timber, you heave the heavy door inward. Stagnant black water rushes across your boots into the vaulted chamber beyond."
        : "You strain against the petrified wood until your muscles tremble, but the corroded iron bands hold fast against the stone jamb. A hollow thud echoes down the flooded hall.",
      currentLocation,
      ambiance: "crypt_solemn" as const,
      checkRequest: undefined,
      suggestedActions: rollResult.success
        ? ["Step through the breached threshold", "Light a torch and inspect the dark chamber", "Have Vaelin scout ahead"]
        : ["Search the rubble for a pry bar", "Have Garrick assist you with a combined shove", "Inspect the hinges for weak points"],
      pointsOfInterest: [
        {
          id: "breached_threshold",
          name: "Shattered Doorframe",
          description: "Jagged splinters of ancient petrified wood framing a flooded passageway.",
          interactAction: "Inspect the passageway",
        },
      ],
      lootEvents: [],
    };

    const validated = GameNarrativeStepSchema.safeParse(dmResponsePayload);
    assert.ok(validated.success, "DM output strictly satisfies Zod GameNarrativeStepSchema");

    // 5. State Machine Update
    const mockLogs: Array<{ id: string; role: string; text: string }> = [];
    mockLogs.push({
      id: "log_action",
      role: "player",
      text: playerAction,
    });
    mockLogs.push({
      id: "log_roll",
      role: "system",
      text: `[DICE ROLL] ${rollResult.breakdown} -> ${rollResult.success ? "SUCCESS" : "FAILURE"}`,
    });
    mockLogs.push({
      id: "log_narrative",
      role: "dm",
      text: validated.data.narrative,
    });

    assert.strictEqual(mockLogs.length, 3);
    assert.ok(mockLogs[2].text.length > 20);
  });

  test("Combat Turn Loop: engage combatant -> attack roll vs AC -> damage resolution -> turn advancement", () => {
    // 1. Initialize Combat Encounter with Player, Companion, and 1 Monster
    const playerCombatant: Omit<Combatant, "initiative" | "actionUsed" | "bonusActionUsed" | "reactionUsed" | "movementUsedFt"> = {
      id: "player_hero",
      name: "Thorin",
      isPlayer: true,
      isCompanion: false,
      isEnemy: false,
      currentHp: 24,
      maxHp: 24,
      tempHp: 0,
      armorClass: 16,
      speed: 30,
      initiativeModifier: 10, // Guarantee high initiative for deterministic test turn order
      conditions: [],
      gridPosition: { x: 3, y: 3 },
      portrait: "/portraits/hero.png",
      weaponAttackBonus: 5,
      weaponDamageDice: "1d8+3",
      weaponDamageType: "bludgeoning",
    };

    const companionCombatant: Omit<Combatant, "initiative" | "actionUsed" | "bonusActionUsed" | "reactionUsed" | "movementUsedFt"> = {
      id: "comp_beatrice",
      name: "Sister Beatrice",
      isPlayer: false,
      isCompanion: true,
      isEnemy: false,
      currentHp: 20,
      maxHp: 20,
      tempHp: 0,
      armorClass: 15,
      speed: 30,
      initiativeModifier: 5,
      conditions: [],
      gridPosition: { x: 2, y: 3 },
      portrait: "/portraits/beatrice.png",
      weaponAttackBonus: 4,
      weaponDamageDice: "1d6+2",
      weaponDamageType: "radiant",
    };

    const skeletonStat = SRD_MONSTERS["skeleton"];
    const skeletonCombatant: Omit<Combatant, "initiative" | "actionUsed" | "bonusActionUsed" | "reactionUsed" | "movementUsedFt"> = {
      id: "monster_skeleton_1",
      name: "Restless Skeleton",
      isPlayer: false,
      isCompanion: false,
      isEnemy: true,
      currentHp: skeletonStat.hitPoints,
      maxHp: skeletonStat.hitPoints,
      tempHp: 0,
      armorClass: skeletonStat.armorClass,
      speed: skeletonStat.speed,
      initiativeModifier: -10, // Low initiative
      conditions: [],
      gridPosition: { x: 3, y: 4 }, // 5ft adjacent
      portrait: "/portraits/skeleton.png",
      weaponAttackBonus: 4,
      weaponDamageDice: "1d6+2",
      weaponDamageType: "piercing",
    };

    let combat = initializeCombat([playerCombatant, companionCombatant, skeletonCombatant]);
    assert.strictEqual(combat.isActive, true);
    assert.strictEqual(combat.round, 1);
    assert.strictEqual(combat.combatants[0].id, "player_hero", "Player won initiative");

    const activeCombatant = combat.combatants[combat.activeTurnIndex];
    assert.strictEqual(activeCombatant.id, "player_hero");
    assert.strictEqual(activeCombatant.actionUsed, false);

    // 2. Player Executes Attack on Skeleton
    const attackRequest: EngineRequest = {
      type: "attack_roll",
      attackerId: "player_hero",
      targetId: "monster_skeleton_1",
      weaponOrSpellId: "warhammer",
      coverBonus: 0,
      attackBonus: 5,
      targetAc: skeletonStat.armorClass,
    };

    const attackResult = resolveEngineRequest(attackRequest);
    assert.ok(attackResult.total >= 1);
    assert.strictEqual(typeof attackResult.success, "boolean");

    // 3. Resolve Damage & Apply to Monster
    const damageRequest: EngineRequest = {
      type: "damage_roll",
      sourceId: "player_hero",
      targetId: "monster_skeleton_1",
      formula: "1d8+3",
      damageType: "bludgeoning",
    };

    const damageResult = resolveEngineRequest(damageRequest);
    assert.ok(damageResult.total >= 4);

    // Apply damage to skeleton
    const skeletonTarget = combat.combatants.find((c) => c.id === "monster_skeleton_1")!;
    const damageOutcome = applyDamageToCombatant(skeletonTarget, damageResult.total);

    // Update combatant in state
    combat.combatants = combat.combatants.map((c) => (c.id === "monster_skeleton_1" ? damageOutcome.combatant : c));
    assert.ok(combat.combatants.find((c) => c.id === "monster_skeleton_1")!.currentHp < skeletonStat.hitPoints);

    // 4. Player Consumes Action and Ends Turn
    const expectedNextCombatantId = combat.combatants[1].id;
    combat.combatants[combat.activeTurnIndex].actionUsed = true;
    combat = advanceTurn(combat);

    // Turn should now advance to the second combatant in the sorted initiative order
    assert.strictEqual(combat.combatants[combat.activeTurnIndex].id, expectedNextCombatantId);
    assert.strictEqual(combat.combatants[combat.activeTurnIndex].actionUsed, false);
    assert.strictEqual(combat.activeTurnIndex, 1);
  });
});
