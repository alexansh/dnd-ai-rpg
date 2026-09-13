import { generateStructuredJson } from "./gemini";
import { GameNarrativeStep } from "./schemas";
import { scanLorebook } from "../services/memory/lorebook";
import { formatAuthorNotePrompt, AuthorNote, DEFAULT_AUTHOR_NOTE } from "../services/memory/authorNote";
import { formatSessionSummaryPrompt, SessionSummaryState, DEFAULT_SESSION_SUMMARY } from "../services/memory/sessionSummary";

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
  inputMode?: "do" | "say" | "story";
  authorNote?: AuthorNote;
  sessionSummary?: SessionSummaryState;
}): Promise<GameNarrativeStep> {
  const mode = params.inputMode || "do";
  const authorNoteText = formatAuthorNotePrompt(params.authorNote || DEFAULT_AUTHOR_NOTE);
  const sessionSummaryText = formatSessionSummaryPrompt(params.sessionSummary || DEFAULT_SESSION_SUMMARY);

  // Scan Lorebook with 600-token budget
  const textBuffer = `${params.currentLocation} ${params.questStep} ${params.playerAction}`;
  const { matchedEntries, tokensUsed: loreTokens } = scanLorebook(textBuffer);
  const loreText = matchedEntries.length
    ? `World Lore Reference:\n${matchedEntries.map((e) => `[${e.category.toUpperCase()}] ${e.content}`).join("\n")}`
    : "";

  let actionFraming = `Player Attempted Action (Do): "${params.playerAction}"`;
  if (mode === "say") {
    actionFraming = `Player In-Character Dialogue (Say): "${params.playerAction}"\n(NPCs/companions react verbally to this dialogue)`;
  } else if (mode === "story") {
    actionFraming = `Player Narrative Steering (Story): "${params.playerAction}"\n(Incorporate this narrative beat into the world progression)`;
  }

  const promptSections = [
    authorNoteText,
    sessionSummaryText,
    loreText,
    `Location: ${params.currentLocation}`,
    `Current Quest Objective: ${params.questStep}`,
    `Party: ${params.partySummary}`,
    params.recentRollResult ? `Previous Check/Roll Result: ${params.recentRollResult}` : "",
    actionFraming,
    `Respond with the next narrative beat according to the GameNarrativeStep schema.`,
  ].filter(Boolean);

  const userPrompt = promptSections.join("\n\n");

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
    lootEvents: [],
  };

  return await generateStructuredJson<GameNarrativeStep>(DM_SYSTEM_PROMPT, userPrompt, fallback);
}