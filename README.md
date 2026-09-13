# ⚔️ The Wayward Flagon — AI Dungeon-Master Tavern RPG

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![D&D 5e](https://img.shields.io/badge/D%26D-5e%20SRD%20Compatible-red)](https://dnd.wizards.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An atmospheric, mechanics-first, browser-based D&D 5e computer RPG inspired by **Baldur's Gate 3** and classic tabletop roleplay. Step into *The Wayward Flagon*, forge your hero, recruit companions, engage in tactical grid combat, and explore a perilous dark fantasy world guided by an autonomous AI Dungeon Master.

---

## 🌟 Architecture & Core Systems

### 1. 🛡️ Hero Forge & Character Creator
- **Playable SRD Ancestries:** Human, High Elf, Mountain Dwarf, Lightfoot Halfling, Tiefling, Dragonborn, Half-Orc (with racial traits, ability bonuses, and portrait descriptors).
- **Core SRD Classes:** Fighter, Cleric, Rogue, Wizard with standard hit dice, weapon/armor proficiencies, and starting gear.
- **5e Standard Array [15, 14, 13, 12, 10, 8]** attribute allocation.
- **AI Portrait Engine:** Routes portrait requests through the backend proxy (`/api/portrait`) using a unified fantasy art style suffix, backed by bundled SVG/JPG fallbacks.

### 2. 🎲 Deterministic 5e Rules & Server Authority
- **Pure-Function Engine (`lib/engine/`):** Pure mathematical resolution for ability checks, saving throws, attack rolls vs. AC with cover (+2/+5 AC), critical hits, damage rolls, and death saving throws.
- **Server Authority (`/api/rules/resolve`):** The LLM never invents numbers or roll results; rolls are generated server-side with `crypto.randomInt` and animated client-side.
- **15 SRD Conditions:** Blinded, Charmed, Deafened, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious, Dead — with duration ticking and mechanical penalties.
- **Concentration Tracking:** Automatic Constitution saving throw checks ($\text{DC} = \max(10, \lfloor\text{damage}/2\rfloor)$) triggered whenever concentrating combatants take damage.

### 3. ⚔️ Tactical 2D Grid Combat
- **5ft Chebyshev Grid:** HTML5 Canvas grid with tokens, health bars, turn halos, movement range highlights, line-of-sight, and cover.
- **Confirm-Before-Commit Attack Panel:** Select enemy to view target AC, range, damage formula, and live d20 hit probability percentage meter before confirming a strike.
- **Opportunity Attacks:** Hostile enemies expend reactions to strike targets leaving their 5ft melee reach without disengaging.

### 4. 🎒 Structured Loot & Inventory
- **SRD Item Catalog:** Full catalog with rarities (Common, Uncommon, Rare, Very Rare, Legendary), weights, costs, and standard 5e carry capacity ($\text{STR} \times 15\text{ lbs}$).
- **Structured Loot Events:** `lootEvents` (`grant_item`, `remove_item`, `grant_gold`, `spend_gold`) ensure the DM cannot narrate items into existence without structured state updates.
- **Interactive Armory & QuickSlot Bar:** Dynamic weight burden bar, coin purse counter, equip/unequip controls, and 1-click consumable usage from the HUD.

### 5. 📜 Full 5e Character Sheet & Action Economy
- **Action Economy Filter Tabs:** `[ All | Actions | Bonus Actions | Reactions | Free ]` categorizing actions, weapon strikes, bonus actions, and reactions.
- **Spell Slot Pip Tracker:** Clickable Level 1 spell slot pips (`● ● ○ ○`) to expend or recover slots.
- **18 SRD Skills:** Interactive skill list with proficiency stars, numeric modifiers, passive perception, and direct click-to-roll mechanics.

### 6. 🧠 Lorebook & Memory Injection
- **Keyword Scanner:** Token-budgeted priority scanner matching keys against recent dialogue turns.
- **Author's Note:** Out-of-character tone and pacing directives injected into DM prompt streams.
- **Rolling Session Summarizer:** Compresses earlier beats to prevent context-window inflation.
- **Segmented Input Dock:** `[ Do | Say | Story ]` mode selector tagging user input for clear DM intent.

### 7. 💾 Multi-Character Save System & Rite of Ash
- **Hero Roster Archive:** Manage multiple character save slots and switch between campaigns without data loss.
- **The Rite of Ash:** Permanent character and campaign purge workflow.

---

## 🛠️ Repository Structure

```
├── app/                  # Next.js 15 App Router pages & API routes
│   ├── api/
│   │   ├── ai/dm/        # Autonomous AI Dungeon Master endpoint
│   │   ├── ai/npc/       # NPC dialogue tree endpoint
│   │   ├── portrait/     # AI Character portrait proxy
│   │   └── rules/        # Server-authoritative rules resolution
│   ├── layout.tsx        # Root layout with Cinzel & Plus Jakarta Sans fonts
│   └── page.tsx          # Single-page tabletop application orchestrator
├── components/           # React UI Components
│   ├── combat/           # AttackPanel (confirm-before-commit)
│   ├── hud/              # ActionDock, CenterViewport, TacticalGrid, DMTerminal, PartyVitals, DiceTray
│   ├── inventory/        # InventoryPanel, QuickSlotBar
│   ├── modals/           # CharacterSheetModal, BestiaryModal, CreationModal, DeleteCharacterModal, CharacterRosterModal
│   └── screens/          # TitleScreen, CampaignSelectModal
├── lib/
│   ├── ai/               # Gemini AI adapters, prompt assembler, Zod schemas
│   ├── campaigns/        # The Sunken Crypt quest stages & map layout
│   ├── engine/           # Deterministic 5e rules, dice, combat, conditions, concentration, inventory
│   ├── services/memory/  # Lorebook, author note, session summary
│   ├── srd/              # 5e SRD reference datasets (classes, races, monsters, spells, items)
│   └── state/            # Zustand global game store with persistence
├── public/               # Bundled fantasy art, tokens, portraits, and audio assets
└── tests/                # Automated Node.js / tsx unit tests
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.18.0 or higher)
- [Git](https://git-scm.com/)

### 1. Clone & Install
```bash
git clone https://github.com/alexansh/dnd-ai-rpg.git
cd dnd-ai-rpg
npm install
```

### 2. Environment Setup (Optional)
```bash
cp .env.example .env
```
> **Note:** The game runs fully offline in **Deterministic Simulation Mode** with built-in procedural DM engines and bundled art. To enable live Gemini AI generation, add your `GEMINI_API_KEY` to `.env`.

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Run Test Suite & Typecheck
```bash
npm test          # Run 39 automated unit tests
npm run typecheck # Run strict TypeScript check
npm run build     # Verify Next.js production build
```

---

## 📄 License
MIT License. See `LICENSE` for details.
