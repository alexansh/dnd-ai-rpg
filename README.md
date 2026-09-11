# ⚔️ The Wayward Flagon — AI Dungeon-Master Tavern RPG

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![D&D 5e](https://img.shields.io/badge/D%26D-5e%20SRD%20Compatible-red)](https://dnd.wizards.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An immersive, atmospheric, AI-driven tabletop RPG experience inspired by **Baldur's Gate 3** and classic **D&D 5th Edition**. Step into *The Wayward Flagon*, forge your hero, choose a chronicle world or forge a new realm with AI, recruit companion adventurers, and explore a 2D interactive world guided by an autonomous AI Dungeon Master.

---

## 🌟 Key Features

### 1. 🛡️ Hero Forge & D&D 5e Character Creator
- **Playable Races & Ancestries:** Human, High Elf, Mountain Dwarf, Lightfoot Halfling, Tiefling, Dragonborn, Half-Orc (with racial traits, ability bonuses, and starting trinkets).
- **Core Classes:** Fighter, Wizard, Rogue, Cleric, Bard, Ranger, Paladin, Barbarian.
- **5e Point-Buy & Standard Array [15, 14, 13, 12, 10, 8]** attribute calculators.
- **Dynamic Lore Generator:** Auto-generates bespoke appearances, origins, motivations, and names with an **"Inspire Name"** shuffle tool.
- **Bespoke Character Art Engine:** Renders live, painterly fantasy portraits matching exact physical descriptions with multi-stage local asset fallbacks.

### 2. 🗺️ World Selection & AI World Forge
- **Curated Chronicle Sagas:**
  - *The Shadowfell Crypt Incursion* (Gothic Catacombs & Lord Morvath)
  - *Crown of the Wyrmspire* (Volcanic Peaks & Vermithrax the Red)
  - *Whispers of the Feywild Court* (Enchanted Forest & Archfey Bargains)
  - *The Sunken Pirate's Grotto* (Coral Reefs & Captain Blacktide)
  - *The Infernal Siege of Ironhold* (Fiendish War Machines & General Baalzun)
- **AI World Forge:** Describe any fantasy realm prompt, select biome and difficulty, and generate a complete World Bible with a **3-Act Narrative Arc** and **2D Connected Road Map**.

### 3. 👥 Baldur's Gate 3-Style Party & Camp System
- **Recruitable Companions:** Grimjaw Ironbound (Dwarf Fighter), Morwen Nightwhisper (Elf Mage), Thalia Dawnbringer (Human Cleric), Vaelin Shadowstep (Elf Rogue), Lyra Moonchime (Halfling Bard), Zephyr Cinderheart (Tiefling Ranger).
- **Companion Banter & Approval Ratings (0–100):** Choices influence companion loyalty and unlock personal dialogue.
- **Campfire Rest System:** Take Short or Long Rests at the camp to heal, remove debuffs, and converse with allies.
- **Tactical Assist Skills:** Call upon allies during ability checks (*Shield Wall*, *Song of Rest*, *Shadow Step*).

### 4. 🎲 2D Tactical World Map & AI Dungeon Master
- **Interactive 2D World Map:** Explore nodes (🏰 *Outposts*, ✨ *Shrines*, ⚔️ *Dungeons*, 💀 *Boss Citadels*) with fog of war and live party tracking.
- **Autonomous AI DM:** Generates 2–5 sentence narrative beats, actionable choices, D&D 5e dice checks (Advantage/Disadvantage), combat encounters, and loot tables.
- **Reactive Pocket Bard Audio Engine:** Procedural ambient soundscapes and combat tracks that dynamically shift intensity levels (1–5) and trigger stingers based on game events.

---

## 🛠️ Tech Stack & Architecture

```
├── client/              # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/  # 2D World Map, PartyBar, DiceRoller, CampRest, PortraitDisplay
│   │   ├── screens/     # Title, Hero Forge, WorldSelect, TavernHub, Adventure
│   │   ├── constants/   # D&D 5e Rules, Campaigns, Companions, Archetypes, SRD
│   │   └── services/    # Pocket Bard Audio Engine, API Proxy Adapter
└── server/              # Node.js + Express Backend Proxy
    ├── services/        # Gemini LLM Adapter, Story Engine, Campaign & Image Generators
    └── scripts/         # Local asset generator & bundler
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/alexansh/the-wayward-flagon.git
cd the-wayward-flagon
```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment (Optional)
```bash
# In server directory, copy .env.example
cp .env.example .env
```
> **Note:** The game runs fully offline in **Smart Simulation Mode** with built-in procedural DM engines and bundled art. To enable live Gemini AI generation, add your `GEMINI_API_KEY` in `server/.env`.

### 4. Launch the Game
```bash
# On Windows, simply double-click:
run-game.bat

# Or run manually in separate terminals:
# Terminal 1 (Backend):
cd server && node server.js

# Terminal 2 (Frontend):
cd client && npm run dev
```

Open **`http://localhost:5173`** in your browser to play!

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).
All D&D 5e mechanics follow the Open Game License (OGL) System Reference Document 5.1.
