import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_OUT_DIR = path.resolve(__dirname, '../../client/public/assets/images');

const makeUrl = (prompt, width = 400, height = 400, seed = 1) => {
  const clean = encodeURIComponent(`${prompt}, warm firelit fantasy art, dnd rpg, digital concept painting`);
  return `https://image.pollinations.ai/prompt/${clean}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=turbo`;
};

const ASSETS_TO_DOWNLOAD = [
  // Scenery (10)
  { folder: 'scenery', name: 'tavern.jpg', url: makeUrl('cozy medieval fantasy tavern interior, roaring stone fireplace, wooden tables with tankards of ale, warm amber candlelight', 896, 504, 777) },
  { folder: 'scenery', name: 'crypt.jpg', url: makeUrl('ancient dungeon crypt corridor, stone sarcophagi, glowing blue torches, carved runes, dark fantasy', 896, 504, 888) },
  { folder: 'scenery', name: 'forest.jpg', url: makeUrl('enchanted fantasy forest, giant mossy oak trees, magical floating will-o-wisps, twilight fog, sunbeams', 896, 504, 999) },
  { folder: 'scenery', name: 'cove.jpg', url: makeUrl('smugglers coastal sea cavern, shipwreck timbers, hanging lanterns, crashing ocean waves, hidden grotto', 896, 504, 555) },
  { folder: 'scenery', name: 'mountains.jpg', url: makeUrl('volcanic obsidian mountains, rivers of molten magma, jagged basalt cliffs, red smoke skies', 896, 504, 444) },
  { folder: 'scenery', name: 'castle.jpg', url: makeUrl('gothic stone castle battlements, distant thunderstorm, royal heraldic banners, stone gargoyles', 896, 504, 333) },
  { folder: 'scenery', name: 'swamp.jpg', url: makeUrl('creepy sunken swamp marshland, gnarled cypress trees, hanging moss, murky green waters, witch lanterns', 896, 504, 222) },
  { folder: 'scenery', name: 'feywilds.jpg', url: makeUrl('magical feywild realm, giant bioluminescent mushrooms, crystal waterfalls, purple and emerald starlight', 896, 504, 111) },
  { folder: 'scenery', name: 'village.jpg', url: makeUrl('medieval village square, timber cottages, cobblestone streets, market stalls, morning sunlight', 896, 504, 666) },
  { folder: 'scenery', name: 'arena.jpg', url: makeUrl('ancient gladiator colosseum arena, golden sands, sunburst sky, iron gates, fantasy battlefield', 896, 504, 771) },

  // NPCs (5)
  { folder: 'npcs', name: 'barnaby.jpg', url: makeUrl('portly jolly medieval tavern barkeep with handlebar mustache, holding wooden tankard of ale, warm firelight portrait', 400, 400, 101) },
  { folder: 'npcs', name: 'stranger.jpg', url: makeUrl('mysterious cloaked rogue in dark hood, glowing eyes in shadow, leather cowl, dagger at hip, fantasy character portrait', 400, 400, 102) },
  { folder: 'npcs', name: 'vespera.jpg', url: makeUrl('mystic fortune teller with tarot cards, glowing crystal orb, silk headscarf, silver amulets, candlelight portrait', 400, 400, 103) },
  { folder: 'npcs', name: 'thorngrim.jpg', url: makeUrl('burly dwarf blacksmith at blazing forge, glowing runic hammer, braided ginger beard, soot marks, fantasy portrait', 400, 400, 104) },
  { folder: 'npcs', name: 'fiona.jpg', url: makeUrl('regal high elven noblewoman with silver tiara, emerald velvet gown, delicate features, fantasy character portrait', 400, 400, 105) },

  // Items (5)
  { folder: 'items', name: 'healing-potion.jpg', url: makeUrl('glass potion bottle with glowing crimson red healing elixir, ornate golden filigree cork, fantasy rpg item', 400, 400, 201) },
  { folder: 'items', name: 'sunblade.jpg', url: makeUrl('ornate magical longsword with glowing golden solar blade, sunburst crossguard, runes, fantasy rpg weapon', 400, 400, 202) },
  { folder: 'items', name: 'grimoire.jpg', url: makeUrl('ancient leather-bound spellbook, glowing arcane glyphs, floating magic rings, fantasy tome', 400, 400, 203) },
  { folder: 'items', name: 'dragon-shield.jpg', url: makeUrl('heavy round shield made of red dragon scales, gold border, smoking embers, fantasy armor', 400, 400, 204) },
  { folder: 'items', name: 'thieves-tools.jpg', url: makeUrl('fine leather pouch with slender silver lockpicks, skeleton keys, fantasy rogue tools', 400, 400, 205) },

  // Enemies (4)
  { folder: 'enemies', name: 'goblin.jpg', url: makeUrl('cunning goblin skirmisher with jagged scimitar, scavenged leather armor, pointy ears, dnd monster portrait', 400, 400, 301) },
  { folder: 'enemies', name: 'skeleton.jpg', url: makeUrl('undead skeleton warrior in rusted iron armor, glowing blue eye sockets, holding chipped greatsword, dnd undead monster', 400, 400, 302) },
  { folder: 'enemies', name: 'red-dragon.jpg', url: makeUrl('colossal ancient red dragon, glowing fire breath in throat, massive horned head, gold hoard background, dnd boss art', 400, 400, 303) },
  { folder: 'enemies', name: 'mimic.jpg', url: makeUrl('mimic monster disguised as treasure chest opening with sharp teeth and purple tongue, spilling gold coins, dnd monster', 400, 400, 304) },

  // Wildlife (3)
  { folder: 'wildlife', name: 'dire-wolf.jpg', url: makeUrl('massive dire wolf with silver-black fur, piercing amber eyes, standing on snowy rock, moonlit forest, dnd beast', 400, 400, 401) },
  { folder: 'wildlife', name: 'owlbear.jpg', url: makeUrl('ferocious owlbear creature, feathered owl head with sharp beak and massive muscular bear body, thick claws, dnd beast', 400, 400, 402) },
  { folder: 'wildlife', name: 'griffin.jpg', url: makeUrl('majestic griffin with golden eagle head and wings and lion body, perched on mountain cliff, fantasy beast art', 400, 400, 403) },

  // Archetypes (6)
  { folder: 'archetypes', name: 'warrior.jpg', url: makeUrl('broad-shouldered warrior with scarred cheek in engraved iron armor, fantasy portrait', 400, 400, 501) },
  { folder: 'archetypes', name: 'rogue.jpg', url: makeUrl('stealthy rogue in dark hooded cowl with amber eyes, twin daggers, fantasy portrait', 400, 400, 502) },
  { folder: 'archetypes', name: 'mage.jpg', url: makeUrl('arcane wizard scholar in sapphire gold-trimmed robes with glowing crystal staff, fantasy portrait', 400, 400, 503) },
  { folder: 'archetypes', name: 'cleric.jpg', url: makeUrl('devout holy cleric in polished bronze breastplate with glowing sun medallion, fantasy portrait', 400, 400, 504) },
  { folder: 'archetypes', name: 'bard.jpg', url: makeUrl('dashing bard performer with plumed cap and rosewood lute, sharp rapier, fantasy portrait', 400, 400, 505) },
  { folder: 'archetypes', name: 'ranger.jpg', url: makeUrl('wild hunter scout with sharp green eyes and recurve yew bow, woodland cloak, fantasy portrait', 400, 400, 506) },

  // Companions (6)
  { folder: 'companions', name: 'thalia.jpg', url: makeUrl('stern holy warrior woman in bronze breastplate with sun medallion, golden halo, cleric companion', 400, 400, 601) },
  { folder: 'companions', name: 'grimjaw.jpg', url: makeUrl('massive scarred dwarf veteran in plate armor, graying beard, battleaxe, warrior companion', 400, 400, 602) },
  { folder: 'companions', name: 'vaelin.jpg', url: makeUrl('slender elven rogue with hooded cowl and violet eyes, midnight leather, rogue companion', 400, 400, 603) },
  { folder: 'companions', name: 'morwen.jpg', url: makeUrl('robed elven arcanist with floating silver runes and starry mantle, wizard companion', 400, 400, 604) },
  { folder: 'companions', name: 'lyra.jpg', url: makeUrl('dashing female bard with plumed cap, rosewood mandolin, vibrant silk doublet, companion', 400, 400, 605) },
  { folder: 'companions', name: 'zephyr.jpg', url: makeUrl('weathered ranger hunter with camouflage mantle, hazel eyes, longbow strapped to back, companion', 400, 400, 606) }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadFileWithRetry(url, targetPath, maxRetries = 3) {
  // If file already downloaded and valid (> 1KB), skip
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 1024) {
    return true;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'WaywardFlagonAssetBundler/1.0' } });
      if (res.status === 429) {
        console.warn(`[Rate limited 429] Backing off ${attempt * 2}s...`);
        await sleep(attempt * 2000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength < 500) throw new Error('File too small');
      fs.writeFileSync(targetPath, Buffer.from(buffer));
      return true;
    } catch (err) {
      if (attempt < maxRetries) {
        await sleep(1500 * attempt);
      }
    }
  }
  return false;
}

async function run() {
  console.log(`Starting asset bundle download into: ${BASE_OUT_DIR}`);

  let downloadedCount = 0;
  let totalBytes = 0;

  for (const asset of ASSETS_TO_DOWNLOAD) {
    const targetDir = path.join(BASE_OUT_DIR, asset.folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, asset.name);
    process.stdout.write(`Downloading [${asset.folder}/${asset.name}]... `);
    
    const success = await downloadFileWithRetry(asset.url, targetPath);
    if (success) {
      downloadedCount++;
      const size = fs.statSync(targetPath).size;
      totalBytes += size;
      console.log(`✓ (${Math.round(size / 1024)} KB)`);
    } else {
      console.log(`✗ Failed`);
    }
    
    // Polite delay between downloads to prevent 429
    await sleep(800);
  }

  console.log(`\n===========================================`);
  console.log(`Successfully bundled ${downloadedCount}/${ASSETS_TO_DOWNLOAD.length} assets!`);
  console.log(`Total Bundle Size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`===========================================\n`);
}

run();
