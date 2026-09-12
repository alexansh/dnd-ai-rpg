import { generateStructuredJson } from "./gemini";
import { GameNarrativeStep } from "./schemas";

const DM_SYSTEM_PROMPT = `You are the Dungeon Master for a dark fantasy D&D 5e cRPG.
Rules for narration:
1. Strict 2 to 4 sentences per narrative beat.
2. Vivid sensory details: sound of dripping water, smell of ozone and decay, flickering torches, chill of stone.
3. ALWAYS end with an actionable dilemma or choice for the player.
4. If the player attempts an uncertain action (e.g. picking a lock, searching for traps, recalling lore, forcing a heavy stone), issue a "checkRequest" with the appropriate skill (Athletics, Stealth, Investigation, Perception, Arcana, etc.) and a realistic 5e DC (10-18).
5. Do NOT hallucinate mathematical check outcomes yourself; request the roll, and when given the result, narrate the outcome based on success or failure.
6. When danger strikes or enemies engage, trigger a "combatTrigger" with enemy IDs.
7. Return strictly valid JSON adhering to the GameNarrativeStep schema.`;

export async function processPlayerAction(params: {
  playerAction: string;
  currentLocation: string;
  questStep: string;
  partySummary: string;
  recentRollResult?: string;
}): Promise<GameNarrativeStep> {
  const userPrompt = `Location: ${params.currentLocation}
Current Quest Objective: ${params.questStep}
Party: ${params.partySummary}
${params.recentRollResult ? `Previous Check/Roll Result: ${params.recentRollResult}` : ""}
Player Input / Action: "${params.playerAction}"

Respond with the next narrative beat according to the GameNarrativeStep schema.`;

  const fallback: GameNarrativeStep = {
    narrative: `You cautiously inspect your surroundings within ${params.currentLocation}. The damp stone walls reflect flickering amber torchlight, and the distant sound of trickling water echoes from the darkness ahead. Before you lies a heavy reinforced ironwood door bound with rusted iron bands. What do you do?`,
    currentLocation: params.currentLocation,
    ambiance: "crypt_solemn",
    checkRequest: {
      skill: "Investigation",
      ability: "int",
      dc: 12,
      reason: "Examine the heavy ironwood door for hidden trigger runes or weak hinges.",
    },
    pointsOfInterest: [
      {
        id: "iron_door",
        name: "Reinforced Ironwood Door",
        description: "Heavy oak reinforced with corroded iron bands and a dwarven keyhole.",
        interactAction: "Inspect the lock mechanism",
      },
      {
        id: "rubble_pile",
        name: "Collapsed Archway",
        description: "A heap of masonry and waterlogged bones that might conceal ancient relics.",
        interactAction: "Search through the rubble",
      },
    ],
    suggestedActions: [
      "Examine the door for traps or glyphs",
      "Attempt to pick the lock with Thieves' Tools",
      "Have Garrick force the door open",
      "Search the rubble pile for clues",
    ],
  };

  return await generateStructuredJson<GameNarrativeStep>(DM_SYSTEM_PROMPT, userPrompt, fallback);
}