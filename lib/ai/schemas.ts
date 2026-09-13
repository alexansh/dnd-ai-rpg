import { z } from "zod";

export const LootEventSchema = z.object({
  type: z.enum(["grant_item", "remove_item", "grant_gold", "spend_gold"]),
  itemId: z.string().optional(),
  itemName: z.string().optional(),
  qty: z.number().optional().default(1),
  gp: z.number().optional().default(0),
  reason: z.string().optional().default("Found or acquired"),
});

export type LootEvent = z.input<typeof LootEventSchema>;

export const GameNarrativeStepSchema = z.object({
  narrative: z.string().describe("Sensory, evocative description of scene, 2-4 sentences, ending with an actionable choice."),
  currentLocation: z.string().describe("Name of current zone or chamber"),
  ambiance: z.enum(["dungeon_creepy", "tavern_warm", "battle_tense", "crypt_solemn", "forest_mystic"]).describe("Audio atmospheric cue"),
  checkRequest: z
    .object({
      skill: z.string(),
      ability: z.enum(["str", "dex", "con", "int", "wis", "cha"]),
      dc: z.number(),
      reason: z.string(),
    })
    .optional()
    .describe("Optional skill check required before proceeding"),
  combatTrigger: z
    .object({
      encounterId: z.string(),
      enemyIds: z.array(z.string()),
      surprise: z.boolean().default(false),
    })
    .optional(),
  companionInterjection: z
    .object({
      companionId: z.string(),
      text: z.string(),
      moodDelta: z.number().min(-5).max(5).default(0),
    })
    .optional(),
  pointsOfInterest: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        interactAction: z.string(),
      })
    )
    .default([]),
  suggestedActions: z.array(z.string()).min(2).max(4),
  lootEvents: z.array(LootEventSchema).default([]),
});

export type GameNarrativeStep = z.infer<typeof GameNarrativeStepSchema>;

export const CombatActionPayloadSchema = z.object({
  actionType: z.enum(["attack", "cast_spell", "dash", "dodge", "use_item", "end_turn"]),
  targetId: z.string().optional(),
  spellId: z.string().optional(),
  itemId: z.string().optional(),
  destination: z.object({ x: z.number(), y: z.number() }).optional(),
  narrativeFluff: z.string().optional(),
});

export type CombatActionPayload = z.infer<typeof CombatActionPayloadSchema>;

export const CompanionDialogueSchema = z.object({
  companionId: z.string(),
  speakerName: z.string(),
  dialogue: z.string(),
  attitudeDelta: z.number().default(0),
  tacticalAdvice: z.string().optional(),
});

export type CompanionDialogue = z.infer<typeof CompanionDialogueSchema>;

export const NPCConversationSchema = z.object({
  npcId: z.string(),
  npcName: z.string(),
  dialogue: z.string(),
  attitude: z.enum(["hostile", "wary", "neutral", "friendly"]),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      checkRequired: z
        .object({
          skill: z.string(),
          dc: z.number(),
          ability: z.enum(["str", "dex", "con", "int", "wis", "cha"]),
        })
        .optional(),
    })
  ),
});

export type NPCConversation = z.infer<typeof NPCConversationSchema>;