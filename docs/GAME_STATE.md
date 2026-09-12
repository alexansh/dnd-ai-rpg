# Game State Architecture & Data Schema

## 1. Existing Game State Analysis

### Current Location of State
Authoritative state currently resides in the React Context (`client/src/context/GameContext.jsx`). The state object is periodically serialized to the browser's `localStorage` under the key `wayward_flagon_save_v2`.

### Current `localStorage` Schema
```json
{
  "character": {
    "name": "Eldrin Thorne",
    "class": "Fighter",
    "race": "human",
    "hp": 24,
    "maxHp": 24,
    "gold": 15,
    "stats": { "STR": 16, "DEX": 13, "CON": 14, "INT": 10, "WIS": 12, "CHA": 8 },
    "inventory": ["Longsword", "Shield", "Chain Shirt", "Ration (3)"],
    "portraitUrl": "https://image.pollinations.ai/...",
    "moralityScore": 10
  },
  "companions": [
    {
      "id": "thalia",
      "name": "Sister Thalia",
      "class": "Cleric",
      "hp": 24,
      "maxHp": 24,
      "approval": 55,
      "loyalty": 55,
      "recruited": true
    }
  ],
  "activeCampaign": { "id": "whispering_crossroads", "title": "The Whispering Crossroads" },
  "activeWorldNode": { "id": "crossroads_outpost", "title": "The Whispering Crossroads" },
  "activeQuest": { "title": "Securing the Old Frontier" },
  "currentLocation": "The Whispering Crossroads",
  "currentSceneKey": "tavern",
  "adventureLog": [
    { "id": "msg_1", "role": "dm", "content": "The fog parts...", "timestamp": "12:00" }
  ],
  "storySummary": "The fellowship embarked toward the crossroads...",
  "turnCount": 4,
  "worldState": {
    "questStage": 2,
    "totalStages": 4,
    "flags": { "spared_corvin": true }
  },
  "completedQuests": [],
  "codexEntries": [],
  "currentScreen": "adventure",
  "lastSaved": "2026-09-12T12:00:00.000Z"
}
```

### Critical Limitations & Risks
1. **Local Isolation**: If the player opens the game in another browser, on mobile, or in an incognito window, their campaign does not exist.
2. **Storage Quota & Eviction**: Browsers silently evict `localStorage` under storage pressure or privacy clearing settings.
3. **No Conflict Resolution / Versioning**: If a user has multiple tabs open, saves overwrite each other unconditionally.

---

## 2. Target Firestore Database Schema

To support persistent, cloud-synchronized, and multi-session single-player campaigns, the target data model uses hierarchical collections under authenticated users:

```
users/{uid}
  ├── displayName: string
  ├── email: string
  ├── createdAt: timestamp
  ├── settings: { textSpeed, volume, autoRoll }
  │
  └── campaigns/{campaignId}
        ├── id: string
        ├── title: string
        ├── genre: string
        ├── createdAt: timestamp
        ├── updatedAt: timestamp
        ├── worldBibleRef: string
        │
        ├── sessions/{sessionId}
        │     ├── id: string
        │     ├── status: "active" | "completed" | "abandoned"
        │     ├── currentAct: number
        │     ├── currentNodeId: string
        │     ├── currentLocation: string
        │     ├── turnCount: number
        │     ├── worldState: {
        │     │     day: number,
        │     │     timeOfDay: string,
        │     │     weather: string,
        │     │     flags: map<string, boolean>
        │     │   }
        │     ├── storySummary: string
        │     ├── createdAt: timestamp
        │     ├── updatedAt: timestamp
        │     └── lastSavedAt: timestamp
        │
        ├── characters/{characterId}
        │     ├── name: string
        │     ├── class: string
        │     ├── race: string
        │     ├── level: number
        │     ├── xp: number
        │     ├── hp: number
        │     ├── maxHp: number
        │     ├── tempHp: number
        │     ├── stats: { STR, DEX, CON, INT, WIS, CHA }
        │     ├── inventory: array<itemObject>
        │     ├── equipped: { mainHand, offHand, armor }
        │     ├── moralityScore: number (-100 to 100)
        │     ├── portraitAssetId: string
        │     └── backstory: string
        │
        ├── parties/{partyId}
        │     ├── companionId: string
        │     ├── name: string
        │     ├── class: string
        │     ├── hp: number
        │     ├── maxHp: number
        │     ├── loyalty: number (-100 to 100)
        │     ├── recruited: boolean
        │     ├── breakingPointTriggered: boolean
        │     └── personalQuestStatus: string
        │
        ├── quests/{questId}
        │     ├── title: string
        │     ├── status: "locked" | "available" | "active" | "completed" | "failed"
        │     ├── currentStage: number
        │     ├── objectives: array<{ id, text, completed }>
        │     └── consequences: map<string, any>
        │
        ├── memories/{memoryId}
        │     ├── event: string
        │     ├── importance: number (0.0 to 1.0)
        │     ├── involvedNPCs: array<string>
        │     ├── timestamp: timestamp
        │     └── summary: string
        │
        └── logs/{turnId}
              ├── turnNumber: number
              ├── role: "dm" | "user" | "companion" | "system"
              ├── actionMode: "do" | "say" | "story" | "check"
              ├── content: string
              ├── checkData: { ability, roll, dc, isSuccess }
              └── timestamp: timestamp
```
