import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_OUT_DIR = path.resolve(__dirname, '../../client/public/assets/images');

// SVG Generator for guaranteed 100% offline, crisp fantasy artwork
const createSvgArt = (title, category, primaryColor, secondaryColor, iconSvg, subtitle = '') => {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.9" />
      <stop offset="50%" stop-color="${secondaryColor}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#0b0604" />
    </radialGradient>
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0c987" />
      <stop offset="50%" stop-color="#d4a574" />
      <stop offset="100%" stop-color="#8a5a2e" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="600" height="600" fill="url(#bgGrad)" />

  <!-- Ambient Light Circle -->
  <circle cx="300" cy="270" r="180" fill="#f0c987" opacity="0.12" filter="url(#glow)" />
  <circle cx="300" cy="270" r="110" fill="${primaryColor}" opacity="0.25" filter="url(#glow)" />

  <!-- Outer Frame -->
  <rect x="18" y="18" width="564" height="564" rx="16" fill="none" stroke="url(#goldBorder)" stroke-width="4" />
  <rect x="28" y="28" width="544" height="544" rx="12" fill="none" stroke="#683e1e" stroke-width="1.5" stroke-dasharray="8,6" />

  <!-- Corner Flourishes -->
  <polygon points="18,18 48,18 18,48" fill="url(#goldBorder)" />
  <polygon points="582,18 552,18 582,48" fill="url(#goldBorder)" />
  <polygon points="18,582 48,582 18,552" fill="url(#goldBorder)" />
  <polygon points="582,582 552,582 582,552" fill="url(#goldBorder)" />

  <!-- Central Icon Emblem Badge -->
  <g transform="translate(300, 260) scale(1.8)">
    <circle cx="0" cy="0" r="46" fill="#140804" stroke="url(#goldBorder)" stroke-width="2" />
    <g transform="translate(-24, -24)">
      ${iconSvg}
    </g>
  </g>

  <!-- Category Tag Banner -->
  <rect x="200" y="430" width="200" height="26" rx="13" fill="#1a0c06" stroke="url(#goldBorder)" stroke-width="1.5" />
  <text x="300" y="447" text-anchor="middle" fill="#f0c987" font-family="Cinzel, Georgia, serif" font-size="11" font-weight="bold" letter-spacing="2">
    ${category.toUpperCase()}
  </text>

  <!-- Title Banner -->
  <rect x="60" y="475" width="480" height="50" rx="8" fill="#140804" stroke="url(#goldBorder)" stroke-width="2" />
  <text x="300" y="506" text-anchor="middle" fill="#f0c987" font-family="Cinzel, Georgia, serif" font-size="18" font-weight="bold" letter-spacing="1">
    ${title}
  </text>
  ${subtitle ? `<text x="300" y="545" text-anchor="middle" fill="#d4a574" opacity="0.8" font-family="system-ui, sans-serif" font-size="12">${subtitle}</text>` : ''}
</svg>
`.trim();
};

const ICONS = {
  sword: `<path d="M38 10L42 14L16 40L10 40L10 34L36 8z" fill="#d4a574" stroke="#f0c987" stroke-width="2"/><path d="M14 34L8 28M30 18L34 22" stroke="#f0c987" stroke-width="2"/>`,
  shield: `<path d="M24 4L8 10V22C8 33 24 44 24 44C24 44 40 33 40 22V10L24 4Z" fill="#2b1810" stroke="#f0c987" stroke-width="2"/>`,
  potion: `<path d="M20 6H28V12L36 24C38 27 38 34 34 38C30 42 18 42 14 38C10 34 10 27 12 24L20 12V6Z" fill="#8a1c14" stroke="#f0c987" stroke-width="2"/><path d="M14 26C18 30 30 30 34 26" stroke="#f0c987" stroke-width="1.5"/>`,
  book: `<path d="M8 8H20C24 8 24 12 24 12C24 12 24 8 28 8H40V40H28C24 40 24 36 24 36C24 36 24 40 20 40H8V8Z" fill="#3a1b0e" stroke="#f0c987" stroke-width="2"/>`,
  skull: `<path d="M12 20C12 12 17 6 24 6C31 6 36 12 36 20C36 25 33 29 30 32V38H18V32C15 29 12 25 12 20Z" fill="#1e2836" stroke="#f0c987" stroke-width="2"/><circle cx="19" cy="18" r="3" fill="#f0c987"/><circle cx="29" cy="18" r="3" fill="#f0c987"/>`,
  dragon: `<path d="M24 4L32 14L44 18L34 26L36 38L24 30L12 38L14 26L4 18L16 14Z" fill="#7a1c14" stroke="#f0c987" stroke-width="2"/>`,
  beast: `<path d="M12 12L20 22L24 14L28 22L36 12L32 30L24 42L16 30Z" fill="#2d472c" stroke="#f0c987" stroke-width="2"/>`,
  user: `<circle cx="24" cy="16" r="8" fill="#4a2a1b" stroke="#f0c987" stroke-width="2"/><path d="M10 40C10 30 16 26 24 26C32 26 38 30 38 40" fill="#2b1810" stroke="#f0c987" stroke-width="2"/>`,
  flame: `<path d="M24 4C24 4 32 14 32 24C32 32 28 40 24 40C20 40 16 32 16 24C16 14 24 4 24 4Z" fill="#d97706" stroke="#f0c987" stroke-width="2"/>`,
  castle: `<path d="M10 40V18L14 18V22L18 22V18L22 18V22L26 22V18L30 18V22L34 18V22L38 22V18L38 40" fill="#2e263d" stroke="#f0c987" stroke-width="2"/>`
};

const ASSETS = [
  // Scenery (10)
  { folder: 'scenery', name: 'tavern.svg', title: 'The Wayward Flagon', category: 'Scenery', color1: '#4a2a1b', color2: '#23130c', icon: ICONS.flame, subtitle: 'Sanctuary of Adventurers' },
  { folder: 'scenery', name: 'crypt.svg', title: 'Forgotten Crypt', category: 'Scenery', color1: '#1e2836', color2: '#111722', icon: ICONS.skull, subtitle: 'Ancient Catacombs' },
  { folder: 'scenery', name: 'forest.svg', title: 'The Whispering Woods', category: 'Scenery', color1: '#1a3320', color2: '#0d1a10', icon: ICONS.beast, subtitle: 'Primeval Enchantment' },
  { folder: 'scenery', name: 'cove.svg', title: 'Smuggler’s Cove', category: 'Scenery', color1: '#182836', color2: '#0e171f', icon: ICONS.shield, subtitle: 'Hidden Grotto' },
  { folder: 'scenery', name: 'mountains.svg', title: 'Obsidian Caldera', category: 'Scenery', color1: '#4a150e', color2: '#200a06', icon: ICONS.dragon, subtitle: 'Volcanic Wyrm Peak' },
  { folder: 'scenery', name: 'castle.svg', title: 'Citadel Ramparts', category: 'Scenery', color1: '#2e263d', color2: '#171221', icon: ICONS.castle, subtitle: 'Royal Stronghold' },
  { folder: 'scenery', name: 'swamp.svg', title: 'The Sunken Mire', category: 'Scenery', color1: '#20331f', color2: '#101c10', icon: ICONS.beast, subtitle: 'Murky Blackwaters' },
  { folder: 'scenery', name: 'feywilds.svg', title: 'Shimmering Fey Realm', category: 'Scenery', color1: '#3b1747', color2: '#1a0821', icon: ICONS.book, subtitle: 'Astral Starlight' },
  { folder: 'scenery', name: 'village.svg', title: 'Oakhaven Square', category: 'Scenery', color1: '#382816', color2: '#1b1208', icon: ICONS.flame, subtitle: 'Medieval Market' },
  { folder: 'scenery', name: 'arena.svg', title: 'Crimson Colosseum', category: 'Scenery', color1: '#4d260f', color2: '#241106', icon: ICONS.sword, subtitle: 'Gladiatorial Sands' },

  // NPCs (5)
  { folder: 'npcs', name: 'barnaby.svg', title: 'Barkeep Barnaby', category: 'NPCs', color1: '#4a2a1b', color2: '#2b1810', icon: ICONS.flame, subtitle: 'Proprietor & Informant' },
  { folder: 'npcs', name: 'stranger.svg', title: 'The Hooded Shadow', category: 'NPCs', color1: '#2b1810', color2: '#140804', icon: ICONS.user, subtitle: 'Guild Broker' },
  { folder: 'npcs', name: 'vespera.svg', title: 'Madame Vespera', category: 'NPCs', color1: '#4d2d73', color2: '#23130c', icon: ICONS.book, subtitle: 'Fortune Teller & Diviner' },
  { folder: 'npcs', name: 'thorngrim.svg', title: 'Master Thorngrim', category: 'NPCs', color1: '#8a4b1e', color2: '#3a1c0e', icon: ICONS.sword, subtitle: 'Dwarven Runic Smith' },
  { folder: 'npcs', name: 'fiona.svg', title: 'Lady Fiona Silverleaf', category: 'NPCs', color1: '#2d472c', color2: '#140804', icon: ICONS.user, subtitle: 'Elven High Diplomat' },

  // Items (5)
  { folder: 'items', name: 'healing-potion.svg', title: 'Potion of Healing', category: 'Items', color1: '#8a1c14', color2: '#3a0c08', icon: ICONS.potion, subtitle: 'Restores Vitality (+10 HP)' },
  { folder: 'items', name: 'sunblade.svg', title: 'Sunforged Longsword', category: 'Items', color1: '#d97706', color2: '#4a2a1b', icon: ICONS.sword, subtitle: 'Radiant Fiendbane Blade' },
  { folder: 'items', name: 'grimoire.svg', title: 'Starlit Grimoire', category: 'Items', color1: '#4d2d73', color2: '#1a0821', icon: ICONS.book, subtitle: 'Ancient Arcane Spellbook' },
  { folder: 'items', name: 'dragon-shield.svg', title: 'Dragonscale Bulwark', category: 'Items', color1: '#8a1c14', color2: '#200a06', icon: ICONS.shield, subtitle: 'Heavy Fire-Resistant Shield' },
  { folder: 'items', name: 'thieves-tools.svg', title: 'Masterwork Lockpicks', category: 'Items', color1: '#3d2014', color2: '#140804', icon: ICONS.sword, subtitle: '+2 Sleight of Hand' },

  // Enemies (4)
  { folder: 'enemies', name: 'goblin.svg', title: 'Gnasher the Skulker', category: 'Enemies', color1: '#2d472c', color2: '#140804', icon: ICONS.sword, subtitle: 'CR 1/2 Goblin Skirmisher' },
  { folder: 'enemies', name: 'skeleton.svg', title: 'Crypt Guardian', category: 'Enemies', color1: '#1e2836', color2: '#0b0f14', icon: ICONS.skull, subtitle: 'CR 2 Undead Sentinel' },
  { folder: 'enemies', name: 'red-dragon.svg', title: 'Ignis the Scourge', category: 'Enemies', color1: '#8a1c14', color2: '#3a0c08', icon: ICONS.dragon, subtitle: 'CR 8 Ancient Red Dragon' },
  { folder: 'enemies', name: 'mimic.svg', title: 'Dungeon Mimic', category: 'Enemies', color1: '#4d2d73', color2: '#1a0821', icon: ICONS.dragon, subtitle: 'CR 2 Deceitful Shapeshifter' },

  // Wildlife (3)
  { folder: 'wildlife', name: 'dire-wolf.svg', title: 'Shadowfang Dire Wolf', category: 'Wildlife', color1: '#1e2836', color2: '#0d1a10', icon: ICONS.beast, subtitle: 'Apex Forest Predator' },
  { folder: 'wildlife', name: 'owlbear.svg', title: 'Great Horned Owlbear', category: 'Wildlife', color1: '#4a2a1b', color2: '#1c0e07', icon: ICONS.beast, subtitle: 'Monstrous Forest Beast' },
  { folder: 'wildlife', name: 'griffin.svg', title: 'Suncrest Griffin', category: 'Wildlife', color1: '#d97706', color2: '#3d2014', icon: ICONS.beast, subtitle: 'Noble Mountain Sovereign' },

  // Archetypes (6)
  { folder: 'archetypes', name: 'warrior.svg', title: 'Warrior Vanguard', category: 'Archetypes', color1: '#8a1c14', color2: '#2b1810', icon: ICONS.shield, subtitle: 'Ironclad Defender' },
  { folder: 'archetypes', name: 'rogue.svg', title: 'Shadowblade Rogue', category: 'Archetypes', color1: '#2d472c', color2: '#140804', icon: ICONS.sword, subtitle: 'Precision Infiltrator' },
  { folder: 'archetypes', name: 'mage.svg', title: 'Arcane Wizard', category: 'Archetypes', color1: '#4d2d73', color2: '#1a0821', icon: ICONS.book, subtitle: 'Master of Spellcraft' },
  { folder: 'archetypes', name: 'cleric.svg', title: 'Holy Cleric', category: 'Archetypes', color1: '#d4a574', color2: '#3a1c0e', icon: ICONS.flame, subtitle: 'Divine Beacon' },
  { folder: 'archetypes', name: 'bard.svg', title: 'Troubadour Bard', category: 'Archetypes', color1: '#8a4b1e', color2: '#23130c', icon: ICONS.flame, subtitle: 'Inspiring Balladeer' },
  { folder: 'archetypes', name: 'ranger.svg', title: 'Wildstrider Ranger', category: 'Archetypes', color1: '#385e38', color2: '#101c10', icon: ICONS.beast, subtitle: 'Wilderness Marksman' },

  // Companions (6)
  { folder: 'companions', name: 'thalia.svg', title: 'Sister Thalia', category: 'Companions', color1: '#d4a574', color2: '#3a1c0e', icon: ICONS.flame, subtitle: 'Cleric Healer & Sentinel' },
  { folder: 'companions', name: 'grimjaw.svg', title: 'Grimjaw Ironbound', category: 'Companions', color1: '#8a1c14', color2: '#2b1810', icon: ICONS.shield, subtitle: 'Vanguard Warrior Tank' },
  { folder: 'companions', name: 'vaelin.svg', title: 'Vaelin Shadowleaf', category: 'Companions', color1: '#2d472c', color2: '#140804', icon: ICONS.sword, subtitle: 'Elven Striker & Thief' },
  { folder: 'companions', name: 'morwen.svg', title: 'Archmage Morwen', category: 'Companions', color1: '#4d2d73', color2: '#1a0821', icon: ICONS.book, subtitle: 'Arcane Controller' },
  { folder: 'companions', name: 'lyra.svg', title: 'Lyra Nightingale', category: 'Companions', color1: '#8a4b1e', color2: '#23130c', icon: ICONS.flame, subtitle: 'Inspiring Bard Support' },
  { folder: 'companions', name: 'zephyr.svg', title: 'Zephyr Windstrider', category: 'Companions', color1: '#385e38', color2: '#101c10', icon: ICONS.beast, subtitle: 'Wilderness Sniper' }
];

function generateLocalAssets() {
  console.log(`Generating local offline assets into: ${BASE_OUT_DIR}`);
  let count = 0;

  for (const asset of ASSETS) {
    const targetDir = path.join(BASE_OUT_DIR, asset.folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, asset.name);
    const svgContent = createSvgArt(asset.title, asset.category, asset.color1, asset.color2, asset.icon, asset.subtitle);
    fs.writeFileSync(targetPath, svgContent);
    count++;
  }

  console.log(`✓ Successfully generated all ${count} guaranteed local offline assets!`);
}

generateLocalAssets();
