import { generateStructuredJson } from "./gemini";
import { NPCConversation } from "./schemas";

export async function getNPCConversation(params: {
  npcId: string;
  npcName: string;
  attitude: "hostile" | "wary" | "neutral" | "friendly";
  playerUtterance?: string;
  dialogueHistory: string[];
}): Promise<NPCConversation> {
  const systemPrompt = `You are roleplaying as the NPC "${params.npcName}" in a D&D 5e dark fantasy dungeon.
Current Attitude: ${params.attitude}
Tone: Gritty, tense, reactive to player tone and reputation.
Return valid JSON adhering to NPCConversation schema with 2-4 interactive player dialogue responses.
Include skill checks in bracket notation where appropriate (e.g. "[Persuasion DC 12]", "[Intimidation DC 14]", "[Insight DC 10]").`;

  const userPrompt = `Dialogue History:
${params.dialogueHistory.join("\n")}
Player just said/did: "${params.playerUtterance ?? "Approaches cautiously"}"`;

  const fallback: NPCConversation = {
    npcId: params.npcId,
    npcName: params.npcName,
    dialogue:
      "Keep your blades sheathed! I didn't mean any harm... I was only seeking my brother's signet ring in these forsaken vaults before the dead began to stir!",
    attitude: params.attitude,
    options: [
      {
        id: "persuade",
        text: "Calm yourself. We are not your enemies. Tell us what lurks in the lower crypt.",
        checkRequired: { skill: "Persuasion", dc: 12, ability: "cha" },
      },
      {
        id: "intimidate",
        text: "Empty your pockets and tell us how to open that sealed door, or we leave you to the ghouls.",
        checkRequired: { skill: "Intimidate", dc: 13, ability: "cha" },
      },
      {
        id: "insight",
        text: "Watch his eyes. Is he truly searching for his brother, or something darker?",
        checkRequired: { skill: "Insight", dc: 11, ability: "wis" },
      },
    ],
  };

  return await generateStructuredJson<NPCConversation>(systemPrompt, userPrompt, fallback);
}