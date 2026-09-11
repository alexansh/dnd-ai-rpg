# The Wayward Flagon - AI Dungeon-Master Tavern RPG

## Core Architecture Rules
- **Stack:** React + Vite + Tailwind CSS, Node/Express backend proxy.
- **Security:** Never call LLM or image-generation APIs directly from frontend code — always route through the backend proxy (`/api/*`).
- **Visual Consistency:** All generated character portraits use the shared style-suffix string: `"{description}, {class} adventurer, warm firelit fantasy portrait, painterly digital art, muted amber and umber palette"`.
- **DM Engine Constraints:**
  - DM narration strictly 2–5 sentences per beat, always ending with something actionable for the player to react to.
  - Dice checks are initiated by the DM requesting a check (e.g., `check: { ability: 'STR', dc: 12, reason: 'Force the heavy oak door open' }`), rolled and animated client-side, and the numeric result is sent back to the DM to narrate the outcome.
  - The LLM does not decide check outcomes purely on its own without dice resolution.
- **Secrets:** No API keys or secrets committed. Read from server environment variables only (`GEMINI_API_KEY`).
