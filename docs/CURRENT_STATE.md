# Existing Feature Inventory & Status Matrix

| System / Feature | Current Status | Implementation Location | Notes & Deficiencies |
| :--- | :--- | :--- | :--- |
| **Character Creation (Quickstart)** | `WORKING` | `client/src/screens/CharacterCreationScreen.jsx` | Selects from 6 archetypes, pre-calculated stats. |
| **Character Creation (Custom 5e Forge)**| `WORKING` | `client/src/screens/CharacterCreationScreen.jsx`, `client/src/constants/dnd5eRules.js` | Point-buy calculation, racial modifiers, dynamic backstories. |
| **Character Portrait Generation** | `PARTIALLY WORKING` | `server/services/imageAdapter.js` | Generates via Imagen 3 or Pollinations, but NOT persisted to disk or cloud storage. Disappears on reload. |
| **Character Sheet & Inventory** | `WORKING` | `client/src/components/CharacterSheet.jsx` | Displays stats, equipment, inventory slots, spell slots. |
| **Tavern Hub & NPC Rumors** | `WORKING` | `client/src/screens/TavernHubScreen.jsx` | Barnaby dialogue, hearth resting, notice board quest selection. |
| **Campaign Selection & AI Forge** | `WORKING` | `client/src/screens/WorldSelectionScreen.jsx`, `server/services/campaignGenerator.js` | Presets and procedural AI prompt generation. |
| **Playable Campaign Slice** | `WORKING` | `client/src/constants/campaigns/whisperingCrossroads.js` | 3-act narrative with Corvin dilemma, 3 distinct endings. |
| **2D Visual Scene Stage** | `WORKING` | `client/src/components/Scene2DView.jsx` | Hotspot pins, dynamic lighting moods, party presence badges. |
| **Decision Matrix (Authored Choices)** | `WORKING` | `client/src/components/DecisionMatrix.jsx` | Color-coded choices, DC badges, predicted companion loyalty. |
| **Action Modes (Do / Say / Story)** | `WORKING` | `client/src/components/DecisionMatrix.jsx`, `server/services/geminiAdapter.js` | Directs AI to treat player action as physical, vocal, or world direction. |
| **Director Tools (Undo / Retry)** | `WORKING` | `client/src/context/GameContext.jsx`, `client/src/components/DecisionMatrix.jsx` | 10-turn snapshot stack; restores previous state on undo. |
| **Party Bar & Loyalty Gauges** | `WORKING` | `client/src/components/PartyBar.jsx`, `client/src/constants/companions.js` | Dual-axis -100 to +100 loyalty, breaking point alerts. |
| **Campfire Social Rest Phase** | `WORKING` | `client/src/components/CampRestModal.jsx` | Short/Long rest, companion firelight conversations, approval gain. |
| **5e SRD Monster / Spell Reference** | `WORKING` | `server/services/dndDataService.js` | Open5e API integration with local offline JSON fallback. |
| **Tactical 5e Combat Bar** | `PARTIALLY WORKING`| `client/src/components/EncounterBar.jsx` | Turn order, action/bonus action selection, but turns resolved loosely. |
| **Tactical Combat Grid / Positions** | `MISSING` | - | No true 2D tactical grid with movement range, line of sight, or cover. |
| **Dice Mechanics (D20 Checks)** | `TEMPORARY` | `client/src/components/DiceRollerModal.jsx` | D20 rolled on client via `Math.random()`. Not server-authoritative. |
| **Physical 3D Dice Throwing** | `MISSING` | - | Canvas animation is 2D CSS pulse rather than physical 3D throw/collision. |
| **World Codex / Lorebook** | `PARTIALLY WORKING`| `client/src/components/CodexModal.jsx`, `server/services/lorebookService.js` | Matches keywords into prompt, but server stores in RAM (`let lorebookStore`). |
| **Audio & SFX Engine** | `WORKING` | `client/src/services/audio.js` | Howler.js procedural Web Audio synthesizer + music layer. |
| **Voice TTS Narration** | `WORKING` | `client/src/services/voiceEngine.js` | Native browser Web Speech API synthesis with rate/pitch control. |
| **Authentication & Accounts** | `MISSING` | - | No user login, no guest accounts, no UID validation. |
| **Cloud Persistence (Firebase)** | `MISSING` | - | Zero cloud database. All state lives in browser `localStorage`. |
| **Cloud Asset Storage** | `MISSING` | - | Generated images are not stored in Firebase Storage. |
| **NPC Memory & Schedules** | `MISSING` | - | NPCs do not have structured daily schedules or persistent memory embeddings. |
| **Automated Test Suite** | `MISSING` | - | No Jest/Vitest unit or integration tests configured. |
