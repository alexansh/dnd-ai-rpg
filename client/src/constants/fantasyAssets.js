/**
 * Curated Fantasy Image Asset Registry for The Wayward Flagon
 * Fast, reliable, high-definition fantasy illustrations with 100% local offline bundling.
 */

export const FANTASY_SCENERY = {
  tavern: {
    id: 'tavern',
    title: 'The Wayward Flagon Interior',
    category: 'Scenery',
    imageUrl: '/assets/images/scenery/tavern.jpg',
    fallbackUrl: '/assets/images/scenery/tavern.svg',
    description: 'A bustling medieval haven bathed in amber firelight, filled with hearty laughter, wooden flagons, and the scent of spiced cider.'
  },
  crypt: {
    id: 'crypt',
    title: 'Forgotten Catacombs & Dungeon Crypt',
    category: 'Scenery',
    imageUrl: '/assets/images/scenery/crypt.jpg',
    fallbackUrl: '/assets/images/scenery/crypt.svg',
    description: 'Ancient damp stone corridors lined with ancient sarcophagi, glowing cyan runes, and eerie blue torchlight.'
  },
  forest: {
    id: 'forest',
    title: 'The Whispering Woods',
    category: 'Scenery',
    imageUrl: '/assets/images/scenery/forest.jpg',
    fallbackUrl: '/assets/images/scenery/forest.svg',
    description: 'Towering primordial oaks enveloped in morning twilight mist, where bioluminescent mushrooms guide lost wanderers.'
  },
  cove: {
    id: 'cove',
    title: 'Smuggler’s Cove & Sea Cave',
    category: 'Scenery',
    imageUrl: '/assets/images/scenery/cove.jpg',
    fallbackUrl: '/assets/images/scenery/cove.svg',
    description: 'A subterranean cavern echoing with crashing swells, rusted iron chains, and smuggler cargo chests.'
  },
  mountains: {
    id: 'mountains',
    title: 'The Obsidian Caldera',
    category: 'Scenery',
    imageUrl: '/assets/images/scenery/mountains.jpg',
    fallbackUrl: '/assets/images/scenery/mountains.svg',
    description: 'Jagged volcanic peaks spewing embers against a blood-red sky, with ancient dragon perches etched into the obsidian stone.'
  },
  castle: {
    id: 'castle',
    title: 'The Citadel Ramparts',
    category: 'Scenery',
    imageUrl: '/assets/images/scenery/castle.jpg',
    fallbackUrl: '/assets/images/scenery/castle.svg',
    description: 'Massive stone fortress battlements overlooking misty valleys, crowned with fluttering heraldic banners.'
  },
  swamp: {
    id: 'swamp',
    title: 'The Sunken Mire',
    category: 'Scenery',
    imageUrl: '/assets/images/scenery/swamp.jpg',
    fallbackUrl: '/assets/images/scenery/swamp.svg',
    description: 'A treacherous peat bog tangled in twisted cypress roots, rising poisonous vapors, and witch lanterns.'
  },
  feywilds: {
    id: 'feywilds',
    title: 'The Shimmering Fey Realm',
    category: 'Scenery',
    imageUrl: '/assets/images/scenery/feywilds.jpg',
    fallbackUrl: '/assets/images/scenery/feywilds.svg',
    description: 'A magical dreamscape of bioluminescent flora, crystal waterfalls flowing backwards, and enchanted silver starlight.'
  },
  village: {
    id: 'village',
    title: 'Oakhaven Village Square',
    category: 'Scenery',
    imageUrl: '/assets/images/scenery/village.jpg',
    fallbackUrl: '/assets/images/scenery/village.svg',
    description: 'Charming cobblestone streets lined with timber-framed shops, blacksmith forges, and colorful market canopies.'
  },
  arena: {
    id: 'arena',
    title: 'The Colosseum of the Crimson Sun',
    category: 'Scenery',
    imageUrl: '/assets/images/scenery/arena.jpg',
    fallbackUrl: '/assets/images/scenery/arena.svg',
    description: 'Sun-drenched crimson sands encircled by towering tier seating and iron gladiatorial pens.'
  }
};

export const FANTASY_NPCS = [
  {
    id: 'barnaby',
    name: 'Barkeep Barnaby',
    role: 'Tavernkeeper & Informant',
    category: 'NPCs',
    imageUrl: '/assets/images/npcs/barnaby.jpg',
    fallbackUrl: '/assets/images/npcs/barnaby.svg',
    description: 'A stout, friendly barkeep with a braided beard and an uncanny ear for dungeon rumors and bounty leads.'
  },
  {
    id: 'stranger',
    name: 'The Hooded Shadow',
    role: 'Rogue & Guild Broker',
    category: 'NPCs',
    imageUrl: '/assets/images/npcs/stranger.jpg',
    fallbackUrl: '/assets/images/npcs/stranger.svg',
    description: 'A solitary figure cloaked in shadows at the corner booth, offering dangerous contracts for daring adventurers.'
  },
  {
    id: 'vespera',
    name: 'Madame Vespera',
    role: 'Fortune Teller & Diviner',
    category: 'NPCs',
    imageUrl: '/assets/images/npcs/vespera.jpg',
    fallbackUrl: '/assets/images/npcs/vespera.svg',
    description: 'Reads ancient celestial cards by the candlelight, unraveling the hidden fates of those brave enough to ask.'
  },
  {
    id: 'thorngrim',
    name: 'Master Thorngrim',
    role: 'Dwarven Runic Blacksmith',
    category: 'NPCs',
    imageUrl: '/assets/images/npcs/thorngrim.jpg',
    fallbackUrl: '/assets/images/npcs/thorngrim.svg',
    description: 'A master artisan whose enchanted steel blades have cleaved dragon scales and shattered demonic curses.'
  },
  {
    id: 'fiona',
    name: 'Lady Fiona Silverleaf',
    role: 'Elven High Ambassador',
    category: 'NPCs',
    imageUrl: '/assets/images/npcs/fiona.jpg',
    fallbackUrl: '/assets/images/npcs/fiona.svg',
    description: 'An elegant diplomat seeking reliable champions to resolve delicate political crises across the kingdoms.'
  }
];

export const FANTASY_ITEMS = [
  {
    id: 'healing-potion',
    name: 'Potion of Greater Healing',
    category: 'Items',
    type: 'Consumable',
    imageUrl: '/assets/images/items/healing-potion.jpg',
    fallbackUrl: '/assets/images/items/healing-potion.svg',
    description: 'A swirling vial of distilled celestial dew. Restores 4d4+4 Hit Points when imbibed.'
  },
  {
    id: 'sunblade',
    name: 'The Sunforged Longsword',
    category: 'Items',
    type: 'Weapon',
    imageUrl: '/assets/images/items/sunblade.jpg',
    fallbackUrl: '/assets/images/items/sunblade.svg',
    description: 'A blade forged in solar fire, dealing +1d8 radiant damage against fiends and undead monstrosities.'
  },
  {
    id: 'grimoire',
    name: 'Grimoire of the Starlit Void',
    category: 'Items',
    type: 'Spellbook',
    imageUrl: '/assets/images/items/grimoire.jpg',
    fallbackUrl: '/assets/images/items/grimoire.svg',
    description: 'Contains lost cantrips of ancient arcanists, granting advantage on Arcana checks.'
  },
  {
    id: 'dragon-shield',
    name: 'Dragonscale Bulwark',
    category: 'Items',
    type: 'Armor',
    imageUrl: '/assets/images/items/dragon-shield.jpg',
    fallbackUrl: '/assets/images/items/dragon-shield.svg',
    description: 'Carved from the hardened breastplate of an ancient wyrm, granting resistance to fire damage.'
  },
  {
    id: 'thieves-tools',
    name: 'Masterwork Lockpicks',
    category: 'Items',
    type: 'Tool',
    imageUrl: '/assets/images/items/thieves-tools.jpg',
    fallbackUrl: '/assets/images/items/thieves-tools.svg',
    description: 'Precision forged needles and tension levers that grant +2 to Sleight of Hand lockpicking checks.'
  }
];

export const FANTASY_ENEMIES = [
  {
    id: 'goblin-boss',
    name: 'Gnasher the Skulker',
    category: 'Enemies',
    cr: 'CR 1/2',
    imageUrl: '/assets/images/enemies/goblin.jpg',
    fallbackUrl: '/assets/images/enemies/goblin.svg',
    description: 'Fast, treacherous, and wielding poisoned bone daggers from the shadows of subterranean caverns.'
  },
  {
    id: 'skeleton-knight',
    name: 'Cursed Crypt Guardian',
    category: 'Enemies',
    cr: 'CR 2',
    imageUrl: '/assets/images/enemies/skeleton.jpg',
    fallbackUrl: '/assets/images/enemies/skeleton.svg',
    description: 'An undying sentinel bound by an ancient necromantic oath to slaughter all who enter the tomb.'
  },
  {
    id: 'red-dragon',
    name: 'Ignis the Scourge',
    category: 'Enemies',
    cr: 'CR 8',
    imageUrl: '/assets/images/enemies/red-dragon.jpg',
    fallbackUrl: '/assets/images/enemies/red-dragon.svg',
    description: 'A terrifying crimson wyrm whose fiery breath incinerates stone and whose scales deflect mortal steel.'
  },
  {
    id: 'mimic',
    name: 'Dungeon Mimic',
    category: 'Enemies',
    cr: 'CR 2',
    imageUrl: '/assets/images/enemies/mimic.jpg',
    fallbackUrl: '/assets/images/enemies/mimic.svg',
    description: 'An insidious shapeshifter lurking as an ornate treasure chest, waiting for greedy fingers.'
  }
];

export const FANTASY_WILDLIFE = [
  {
    id: 'dire-wolf',
    name: 'Shadowfang Dire Wolf',
    category: 'Wildlife',
    imageUrl: '/assets/images/wildlife/dire-wolf.jpg',
    fallbackUrl: '/assets/images/wildlife/dire-wolf.svg',
    description: 'A giant predator of the northern pines, hunting in packs with lethal pack tactics and terrifying speed.'
  },
  {
    id: 'owlbear',
    name: 'Great Horned Owlbear',
    category: 'Wildlife',
    imageUrl: '/assets/images/wildlife/owlbear.jpg',
    fallbackUrl: '/assets/images/wildlife/owlbear.svg',
    description: 'A monstrous blend of predatory owl and savage bear, guarding its mountain territory with relentless fury.'
  },
  {
    id: 'griffin',
    name: 'Suncrest Griffin',
    category: 'Wildlife',
    imageUrl: '/assets/images/wildlife/griffin.jpg',
    fallbackUrl: '/assets/images/wildlife/griffin.svg',
    description: 'Noble aerial predators with the keen vision of a raptor and the devastating pounce of a lion.'
  }
];
