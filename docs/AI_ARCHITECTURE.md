# AI Dungeon Master Architecture & Tool Integration

## 1. Existing AI Integration Analysis

### Active Endpoints & Services
- **`server/services/geminiAdapter.js`**: Connects via HTTP POST to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`.
- **`server/services/mockDM.js`**: Comprehensive simulation engine that responds with authored branches, procedural checks, and dialogue when no `GEMINI_API_KEY` is present or when offline.
- **`server/services/lorebookService.js`**: Keyword scanning that injects codex lore into the prompt.
- **`server/services/storyGuardrails.js`**: Pacing constraints based on quest stage (1 to 4).

### Current Prompt Structure
```
System Instruction:
- Strict 2 to 5 sentences narrative limit.
- Pacing directives based on quest tag (Bounty, Mystery, Exploration, Boss).
- Action mode directive (Do, Say, Story).
- Story guardrails (Stage 1: Arrival -> Stage 4: Climax).
- World codex matched entries.
- SRD monster stat blocks (if applicable).
- Response MIME: application/json.
```

### Existing Vulnerabilities & Anti-Patterns
1. **Loose JSON Contract**: The LLM currently outputs `hpChange`, `goldChange`, and `loot` directly. While the client applies deterministic bounds, the LLM still has the opportunity to suggest random items or arbitrary numbers.
2. **Context Window Drift**: Recent turns are sent as raw text history (`history.slice(-4)`). There is no episodic memory retrieval or structured semantic vector index.
3. **Prompt Injection Risk**: Player text is interpolated directly into `LATEST PLAYER INPUT: Action: "${action}"` without sanitization or boundary tokens.
4. **No Formal Tool-Calling Interface**: The LLM does not call isolated, atomic tools (e.g. `rollSkillCheck()`, `moveEntity()`, `unlockDoor()`). It produces a monolithic JSON blob intended to represent both narration and mutations simultaneously.

---

## 2. Target Production AI Architecture

```
                    PLAYER NATURAL LANGUAGE / ACTION
                                   │
                                   ▼
                       INTENT CLASSIFIER & PARSER
             (Maps player text to candidate tool operation)
                                   │
                                   ▼
                        STORY DIRECTOR AGENT
           (Checks Campaign World Bible & Scene Boundaries)
                                   │
                                   ▼
                      DETERMINISTIC GAME ENGINE
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
         VALIDATE INPUT      EXECUTE RULES       MUTATE STATE
         - Permissions       - D20 Rolls         - HP / Gold
         - Entity Presence   - DC checks         - Inventory
         - Inventory ownership- Combat math      - World flags
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
                        AUTHORITATIVE OUTCOME
                                   │
                                   ▼
                       AI DUNGEON MASTER PROMPT
              (Context Package: Scene + Result + State)
                                   │
                                   ▼
                     SENSORY NARRATION & DIALOGUE
                   (2 to 4 sentences + Audio Cues)
```

### Approved Tool Manifest for AI DM
The AI DM interacts with the game exclusively through verified function declarations:
1. `requestSkillCheck({ ability: "STR"|"DEX"|"CON"|"INT"|"WIS"|"CHA", dc: number, reason: string })`
2. `queryWorldEntity({ entityId: string })`
3. `queryNPCKnowledge({ npcId: string, topic: string })`
4. `proposeLootDrop({ tableId: string, maxItems: number })`
5. `transitionSceneNode({ targetNodeId: string, travelNarrative: string })`
6. `triggerCombatEncounter({ encounterId: string, surpriseFactor: boolean })`
