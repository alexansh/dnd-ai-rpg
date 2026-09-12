# Architecture Blueprint: The Wayward Flagon

## 1. System Overview

"The Wayward Flagon" (`alexansh/dnd-ai-rpg`) is an interactive fantasy RPG hybrid combining structured 2D CRPG mechanics (reminiscent of Baldur's Gate 3 and classic tabletop adventures) with an AI-powered Dungeon Master and companion dialogue.

---

## 2. Current Architecture (As Audited)

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                       │
│  React 19 + Vite 6 + Tailwind CSS + Framer Motion + Howler  │
│                                                             │
│  Screens:                                                   │
│    - TitleScreen.jsx                                        │
│    - CharacterCreationScreen.jsx                            │
│    - TavernHubScreen.jsx                                    │
│    - WorldSelectionScreen.jsx                               │
│    - AdventureScreen.jsx                                    │
│                                                             │
│  State & Persistence:                                       │
│    - GameContext.jsx (Monolithic client state)              │
│    - Browser localStorage ('wayward_flagon_save_v2')        │
│    - Client-authoritative dice rolling & HP computation     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP /api/* (Vite Proxy)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND PROXY (Node/Express)               │
│                  Port 3001 (server/server.js)               │
│                                                             │
│  Services:                                                  │
│    - geminiAdapter.js (Gemini 2.5 Flash REST API)           │
│    - mockDM.js (Offline procedural simulation engine)       │
│    - imageAdapter.js (Imagen 3 / Pollinations AI / SVG)     │
│    - sceneImageAdapter.js (In-memory Map cache + Pollin.)   │
│    - lorebookService.js (In-memory array store)             │
│    - deterministicEngine.js (Pure state delta reducer)      │
│    - campaignGenerator.js (AI procedural campaign builder)  │
│    - dndDataService.js (Open5e REST proxy / local fallback) │
│                                                             │
│  Persistence:                                               │
│    - ZERO database or cloud storage                         │
│    - In-memory variables for caches and codex store         │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
     Google Gemini 2.5 Flash            Pollinations AI
     (Generative Language API)        (Ephemeral Image CDN)
```

---

## 3. Critical Architectural Flaws in Current Setup

1. **Client-Authoritative Truth**: The browser calculates dice rolls, applies damage, mutates inventory, and decides check successes, sending claims to the server.
2. **Ephemeral Asset Pipeline**: Generated character portraits and scene images are either base64 strings in memory or ephemeral Pollinations URLs that change on every reload or expire.
3. **Absence of User Identity & Server Persistence**: There is no authentication. Game sessions are saved in `localStorage`. Multiple devices, browser cache clears, or incognito tabs cause immediate data loss.
4. **In-Memory Server State**: `sceneImageAdapter.js` maintains `new Map()`, and `lorebookService.js` stores codex entries in `let lorebookStore = [...]`. Any server restart or scaling resets this data.
5. **Lack of Automated Testing**: No unit, integration, or rules compliance tests exist in the codebase.

---

## 4. Target Production Architecture

```
                                  CLIENT
                                    │
                     ├── UI Presentation Layer (React + Tailwind)
                     ├── Local Visual & Audio Systems (Howler + Animations)
                     ├── Physics Dice Visualizer (Client-Side Rendering)
                     └── Firebase Client SDK (Auth, Firestore Listeners)
                                    │
                         HTTPS / WebSockets / gRPC
                                    │
                                    ▼
                         GAME APPLICATION SERVER
                          (Node.js / Express API)
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
SESSION & AUTH MANAGER      RULES & COMBAT ENGINE           AI ORCHESTRATION
- Token verification        - Server-Authoritative D20      - Story Director
- Session state loader      - D&D 5e SRD Mechanics          - DM Prompt Engine
- Rate limiting             - Combat State Machine          - Tool Execution
- Auto-save triggers        - Deterministic Reducer         - Context Builder
    │                               │                               │
    └───────────────────────────────┼───────────────────────────────┘
                                    ▼
                          PERSISTENCE LAYER
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
FIREBASE AUTH            CLOUD FIRESTORE            FIREBASE STORAGE
- Anonymous/Guest        - Users & Campaigns        - Generated Portraits
- Persistent Accounts    - Sessions & Save Slots    - Scene Concept Art
- Token verification     - NPC & World State        - Content-Addressed Assets
                         - Asset Registry           - Permanent CDN URLs
```
