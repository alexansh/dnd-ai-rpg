# Error & Anomaly Log

| Date | Subsystem | Issue Identified | Impact | Resolution Strategy |
| :--- | :--- | :--- | :--- | :--- |
| 2026-09-12 | Image Generation | Pollinations AI URL uses unpersisted `randomSeed` | Changing faces on reload | Content-addressed SHA256 hashing + Firebase Storage upload in Phase 2 |
| 2026-09-12 | Scene Art Cache | `sceneCache = new Map()` in NodeJS memory | Cache wiped on server restart | Move asset records to Cloud Firestore `assets` collection in Phase 2 |
| 2026-09-12 | Lorebook Store | `lorebookStore = [...]` stored in NodeJS RAM | New codex discoveries lost on restart | Move codex entries to Firestore `campaigns/{id}/codex` in Phase 1 & 6 |
| 2026-09-12 | Dice Checks | Dice rolled via client `Math.random()` | Client can send spoofed rolls | Implement server-authoritative `/api/rules/roll` with secure PRNG in Phase 3 |
| 2026-09-12 | Game State | Game state stored strictly in browser `localStorage` | Cross-device play impossible | Migrate state to Cloud Firestore under authenticated user UIDs in Phase 1 |
