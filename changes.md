# System Changelog

### 2026-09-12 — Phase 0: Repository Audit & Architectural Documentation
- **Files Created**:
  - `docs/ARCHITECTURE.md`: Overview of current vs target architecture.
  - `docs/CURRENT_STATE.md`: Feature inventory with status ratings.
  - `docs/GAME_STATE.md`: LocalStorage vs target Firestore schema.
  - `docs/AI_ARCHITECTURE.md`: Gemini 2.5 Flash, simulation fallback, and target tool-calling design.
  - `docs/FIREBASE_ARCHITECTURE.md`: Auth, Firestore rules, Storage hierarchy, emulator config.
  - `docs/ASSET_PIPELINE.md`: Analysis of image loss root cause and content-addressed persistence pipeline.
  - `docs/RULES_ENGINE.md`: 5e mechanics specification and server-authoritative dice protocol.
  - `docs/PRODUCTION_CHECKLIST.md`: Complete matrix of production criteria.
  - `docs/MIGRATION_PLAN.md`: Phased execution roadmap.
  - `progress.md`, `changes.md`, `errors.md`: System audit tracking files.
- **Code Modifications**:
  - Preserved all working application code in `client/` and `server/`.
  - Audited dependencies, routes, state management, and assets.
