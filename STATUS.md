# 🛡️ The Wayward Flagon — Pre-Flight Production Audit (`STATUS.md`)
**Timestamp:** September 13, 2026 | **Lead Engineer:** Antigravity AI

---

## 1. Stack Contradiction Resolution

| Stated in Legacy Docs | Actual Repository Implementation | Action Taken |
| :--- | :--- | :--- |
| `client/` (React 18 + Vite) + `server/` (Node/Express) split | Unified **Next.js 15.2.0 (App Router) + React 19.0.0 + TypeScript 5.7.3 (strict mode) + Tailwind CSS 3.4.17** | Updated `README.md` and `GEMINI.md` to eliminate stale references to Vite, Express, and separate client/server folders. |

- **Frontend:** Server and client components inside `app/` and `components/`. Single unified build process via `next build`.
- **Backend Proxy & APIs:** Next.js Route Handlers inside `app/api/*` (`/api/ai/dm`, `/api/ai/npc`, `/api/portrait`, `/api/rules/resolve`).
- **State Management:** Zustand 5.0 with persistence middleware.
- **Rules Engine:** Server-side deterministic TypeScript module in `lib/engine/`.

---

## 2. Feature Inventory (Working vs. Stubbed/Mocked/Missing)

| Feature Claimed in README | Actual Implementation State | Verification Notes & Code References |
| :--- | :--- | :--- |
| **Hero Forge (Character Creator)** | **Fully Working** | `components/modals/CreationModal.tsx`: Uses 5e Standard Array, applies racial bonuses, calculates starting gear and hit die, connects to `/api/portrait` proxy with local fallback assets, creates persistent character save slots. |
| **Autonomous AI DM Narration** | **Fully Working** | `app/api/ai/dm/route.ts` & `lib/ai/dm-agent.ts`: Generates 2–4 sentence sensory narrative beats, strictly issues structured `checkRequest` and `lootEvents` schemas via Zod, enforces token budgets, and provides deterministic fallback when offline or unauthenticated. |
| **Deterministic Rules Engine** | **Fully Working** | `lib/engine/resolver.ts`, `lib/engine/rules.ts`, `lib/engine/dice.ts`: Computes ability modifiers, DC checks, AC attack rolls with cover (+2/+5 AC), damage with resistances/immunities, and death saving throws. 39 automated unit tests pass. |
| **Server-Authoritative Dice** | **Fully Working** | `/api/rules/resolve`: Uses `crypto.randomInt` to generate verified server results. Client animates dice rolls against the known outcome. |
| **15 SRD Conditions & Concentration** | **Fully Working** | `lib/engine/conditions.ts` & `concentration.ts`: Tracks rounds remaining, applies prone/restrained modifiers, auto-triggers CON saves on damage ($\text{DC} = \max(10, \lfloor\text{damage}/2\rfloor)$). |
| **Tactical 2D Battle Grid** | **Fully Working** | `components/hud/TacticalGrid.tsx`: HTML5 Canvas 5ft square grid, Chebyshev distance, line of sight, cover detection, and turn halos. |
| **Confirm-Before-Commit Attack Panel** | **Fully Working** | `components/combat/AttackPanel.tsx`: Displays target AC, range, damage formula, and live d20 hit probability percentage meter before confirming attacks. |
| **Opportunity Attack Reactions** | **Fully Working** | `lib/engine/combat.ts`: Triggers hostile reaction melee attacks when a combatant leaves an enemy's 5ft reach without disengaging. |
| **Structured Loot & Inventory** | **Fully Working** | `lib/engine/inventory.ts` & `components/inventory/InventoryPanel.tsx`: SRD item catalog with rarities and weights, carry capacity ($\text{STR} \times 15\text{ lbs}$), coin purse, equip/unequip AC recalculation, and 1-click `QuickSlotBar`. |
| **5e Character Sheet & Action Economy** | **Fully Working** | `components/modals/CharacterSheetModal.tsx`: Filter tabs (`All | Actions | Bonus Actions | Reactions | Free`), spell slot pips tracker (`● ● ○ ○`), condition tray, and 18 SRD skills with roll handlers. |
| **Lorebook & Context Memory** | **Fully Working** | `lib/services/memory/lorebook.ts`: Token-budgeted priority scanner matching keys, author's note steering (`authorNote.ts`), and rolling session compression (`sessionSummary.ts`). |
| **Story / Do / Say Input Dock** | **Fully Working** | `components/hud/ActionDock.tsx`: Segmented `[ Do | Say | Story ]` mode selector with dynamic placeholders and tagged server routing. |
| **Multi-Character Save & Rite of Ash** | **Fully Working** | `components/modals/CharacterRosterModal.tsx` & `DeleteCharacterModal.tsx`: Multi-character save slot management, active hero switching, and permanent campaign & hero deletion. |
| **Companion Approval System** | **Partially Working** | `components/hud/PartyVitals.tsx`: Displays Sister Beatrice, Vaelin, and Garrick with roles, portraits, and approval numbers (`+20`, `+10`, `+25`), and companions act autonomously in combat. However, branching dialogue trees tied to approval are currently simplified. |
| **Campaign Module: The Sunken Crypt** | **Fully Working** | `lib/campaigns/sunkenCrypt.ts`: 4 structured acts (Entrance, Flooded Ossuary, Crypt Antechamber Combat, Tomb of the Wight Lord Boss) with scripted triggers and tactical map layout. |
| **AI World Forge** | **Not Present / Aspirational** | Free-form dynamic world bible generation from custom text prompts was a claim in the old README; only curated campaign modules exist currently. |
| **2D Overworld Connected Road Map** | **Not Present / Aspirational** | Overworld node-based graph with outposts and fog-of-war is not implemented; exploration currently switches between Theater of the Mind scenes and the 2D Tactical Battle Grid. |
| **Pocket Bard Audio Engine** | **UI-Only / Stubbed** | `components/audio/SoundscapePlayer.tsx`: Displays ambiance status labels (e.g. *Battle Drums • The Crypt Awakens*) and a mute toggle, but does not load or synthesize actual audio tracks. |

---

## 3. Secret & Credential Handling Audit

- **Environment File Hygiene:**
  - `.gitignore` properly ignores `.env`, `.env.local`, `.env.*.local`, `*.env`.
  - `.env.example` contains only `GEMINI_API_KEY=` with no committed secrets.
  - Zero hardcoded API keys detected across the entire codebase (`grep` scan returned 0 results).
- **Client/Server Isolation:**
  - `GEMINI_API_KEY` is read strictly via `process.env.GEMINI_API_KEY` inside server-side code (`lib/ai/gemini.ts`), which is only invoked by Next.js Route Handlers (`app/api/ai/*`).
  - No `NEXT_PUBLIC_` prefixes on secrets.
  - Offline/unauthenticated fallback mode operates without throwing uncaught exceptions or leaking server errors to the client.

---

## 4. Production-Readiness Gap Analysis

1. **Persistence:**
   - Current persistence uses Zustand's `localStorage` middleware (`wayward_flagon_5e_save`).
   - For a public commercial release, player accounts, save slots, and campaign chronicles should be backed by an external database (SQLite/PostgreSQL via Prisma or Supabase) to prevent accidental cache-clearing loss.
2. **Audio Experience:**
   - Pocket Bard needs real Web Audio ambient soundscapes / combat music or a curated asset library matching the ambiance states.
3. **Session Rate Limiting & Cost Ceilings:**
   - Add IP or session-based rate limiting on `/api/ai/*` to guard against runaway LLM billing.
4. **Error & Telemetry Monitoring:**
   - Integrate Sentry or structured server logging for failed LLM inferences and API latency.

---

## 5. Next Steps
With Step 0 completed, the stack documented, secrets verified, and the feature inventory audited, we can proceed to implement production hardening and the phased deliverables.
