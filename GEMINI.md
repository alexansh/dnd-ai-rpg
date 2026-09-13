# The Wayward Flagon - AI Dungeon-Master Tavern RPG

## Core Architecture Rules
- **Stack:** Unified Next.js 15 (App Router) + React 19 + TypeScript (strict mode) + Tailwind CSS 3.4. Server endpoints are Next.js Route Handlers (`app/api/*`).
- **Security:** Never call LLM or image-generation APIs directly from frontend code — always route through the backend route handlers (`/api/*`).
- **Visual Consistency:** All generated character portraits use the shared style-suffix string: `"{description}, {class} adventurer, warm firelit fantasy portrait, painterly digital art, muted amber and umber palette"`.
- **DM Engine Constraints:**
  - DM narration strictly 2–5 sentences per beat, always ending with something actionable for the player to react to.
  - The LLM never adjudicates numeric outcomes. Dice checks are initiated by the DM requesting a check (e.g., `checkRequest: { ability: 'str', dc: 12, reason: 'Force the heavy oak door open' }`), rolled and resolved via the deterministic server rules engine (`/api/rules/resolve`), and the numeric result is provided to the DM to narrate the outcome.
  - Roll generation is server-authoritative (`crypto.randomInt`), animated client-side against the verified outcome.
- **Secrets:** No API keys or secrets committed. Read from server environment variables only (`GEMINI_API_KEY`).
