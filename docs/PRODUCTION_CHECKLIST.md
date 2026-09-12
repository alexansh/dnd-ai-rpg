# Production Readiness Checklist

| Category | Requirement | Current Status | Target Phase |
| :--- | :--- | :---: | :---: |
| **Architecture** | Clean separation of Presentation, Rules Engine, AI, and Persistence | `NOT READY` | Phase 1 & 3 |
| **Authentication** | Anonymous/Guest play with persistent UID and linking to Email/Google | `NOT READY` | Phase 1 |
| **Authorization** | Server-side token validation; users cannot read/modify foreign data | `NOT READY` | Phase 1 |
| **Persistence** | Cloud Firestore authoritative storage for all campaigns, sessions & logs | `NOT READY` | Phase 1 |
| **Security Rules** | Granular Firestore and Storage rules restricting access to owner UIDs | `NOT READY` | Phase 1 |
| **Storage** | Firebase Storage for character portraits and generated scene backgrounds | `NOT READY` | Phase 2 |
| **Image Persistence** | Content-addressed SHA256 hashing preventing regeneration on restart | `NOT READY` | Phase 2 |
| **Asset Fallbacks** | Procedural SVG and bundled raster art available on generation failure | `READY` | Pre-existing |
| **Rules Correctness** | Server-authoritative D20 rolls, DC validation, ability score modifiers | `NOT READY` | Phase 3 |
| **Combat Engine** | Deterministic combat state machine with AC, damage formulas & turn order | `PARTIALLY READY` | Phase 3 & 8 |
| **World State** | Persistent location nodes, time of day, weather, and world flags | `PARTIALLY READY` | Phase 4 |
| **NPCs** | Persistent NPC state with dialogue history and relationship status | `NOT READY` | Phase 4 |
| **Companions** | Dual-axis loyalty (-100 to 100), breaking point mutinies & tactical assist | `READY` | Phase 5 |
| **Campfire Rest** | Short/Long rest mechanics with conversational approval shifts | `READY` | Phase 5 |
| **Campaigns** | Authored multi-act campaign structure with branching endings | `READY` | Phase 6 |
| **Story Director** | High-level act/scene pacing guardrails above moment-to-moment DM | `PARTIALLY READY` | Phase 6 |
| **Quests & Journal** | Structured quest objectives with persistent consequences and codex | `PARTIALLY READY` | Phase 6 |
| **AI DM Integration** | Strict JSON schema output with 2-5 sentence narrative and actionable hook | `READY` | Phase 7 |
| **AI Tool Calling** | Tool-calling boundary preventing LLM from hallucinating stats/loot | `NOT READY` | Phase 7 |
| **AI Cost Control** | Caching, prompt deduplication, and simulation fallback when offline | `READY` | Phase 7 |
| **Physical Dice UI** | 3D visual dice throwing settling precisely on server-generated result | `NOT READY` | Phase 8 |
| **Save / Load Slots** | Multi-slot save management with auto-save at major narrative boundaries | `NOT READY` | Phase 1 & 9 |
| **Audio & SFX** | Procedural Web Audio synthesizer + mood transitions + native TTS | `READY` | Phase 9 |
| **Testing** | Automated unit, integration, and rules engine test suites | `NOT READY` | Phase 10 |
| **Observability** | Structured request/error logging without secret exposure | `NOT READY` | Phase 10 |
| **Secrets & Keys** | Zero API keys committed to Git or exposed to client bundle | `READY` | Ongoing |
| **Responsive UI** | Seamless desktop and mobile layout with touch-friendly hotspots | `READY` | Phase 9 |
