export const DND_RACES = [
  {
    id: 'human',
    name: 'Human',
    description: 'Versatile, ambitious, and hardy survivors found in every corner of the realm.',
    bonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    trait: 'Extraordinary Adaptability (+1 to all Ability Scores)',
    racialTrinket: 'Pewter Luck Token',
    speed: 30
  },
  {
    id: 'elf',
    name: 'High Elf',
    description: 'Graceful beings of ethereal beauty, keen intellect, and ancient arcane heritage.',
    bonuses: { STR: 0, DEX: 2, CON: 0, INT: 1, WIS: 0, CHA: 0 },
    trait: 'Keen Senses & Arcane Heritage (+2 DEX, +1 INT)',
    racialTrinket: 'Elven Waybread & Star Locket',
    speed: 30
  },
  {
    id: 'dwarf',
    name: 'Mountain Dwarf',
    description: 'Stout, resolute warriors with stone-forged resilience and unyielding courage.',
    bonuses: { STR: 2, DEX: 0, CON: 2, INT: 0, WIS: 0, CHA: 0 },
    trait: 'Dwarven Toughness & Stonecunning (+2 CON, +2 STR)',
    racialTrinket: 'Clan Iron Seal & Stonecutter Flask',
    speed: 25
  },
  {
    id: 'halfling',
    name: 'Lightfoot Halfling',
    description: 'Nimble, cheerful folk blessed with uncanny luck and stealth in tight corners.',
    bonuses: { STR: 0, DEX: 2, CON: 0, INT: 0, WIS: 0, CHA: 1 },
    trait: 'Halfling Nimbleness & Lucky (+2 DEX, +1 CHA)',
    racialTrinket: 'Four-Leaf Clover & Honey Pastry',
    speed: 25
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    description: 'Charismatic individuals touched by an otherworldly fiendish bloodline.',
    bonuses: { STR: 0, DEX: 0, CON: 0, INT: 1, WIS: 0, CHA: 2 },
    trait: 'Infernal Legacy & Darkvision (+2 CHA, +1 INT)',
    racialTrinket: 'Smoldering Brimstone Amulet',
    speed: 30
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description: 'Proud draconic humanoids wielding the elemental power of ancient wyrms.',
    bonuses: { STR: 2, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 1 },
    trait: 'Draconic Ancestry & Breath Weapon (+2 STR, +1 CHA)',
    racialTrinket: 'Ancestral Wyrm Scale Talisman',
    speed: 30
  },
  {
    id: 'half_orc',
    name: 'Half-Orc',
    description: 'Ferocious fighters combining human tenacity with savage physical power.',
    bonuses: { STR: 2, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: 0 },
    trait: 'Relentless Endurance & Savage Attacks (+2 STR, +1 CON)',
    racialTrinket: 'War Trophy Fang Necklace',
    speed: 30
  }
];

export const DND_CLASSES = [
  {
    id: 'Fighter',
    name: 'Fighter',
    hitDie: 10,
    baseHp: 10,
    primaryStat: 'STR',
    subtitle: 'Master of Martial Prowess',
    description: 'A disciplined combatant proficient with all weapons, heavy armor, and battlefield tactics.',
    abilities: ['Action Surge (gain extra action)', 'Second Wind (heal 1d10+1 HP)', 'Fighting Style'],
    defaultInventory: ['Steel Longsword', 'Heavy Shield', 'Chainmail Armor', 'Crossbow with 20 Bolts', 'Adventurer Pack'],
    startingGold: 35
  },
  {
    id: 'Wizard',
    name: 'Wizard',
    hitDie: 6,
    baseHp: 6,
    primaryStat: 'INT',
    subtitle: 'Scholar of the Arcane',
    description: 'A master of spellcraft who commands elemental forces, teleportation, and reality-bending wards.',
    abilities: ['Fireball (blazing INT blast)', 'Mage Armor (boost defense)', 'Arcane Recovery'],
    defaultInventory: ['Carved Arcane Focus Wand', 'Leather-bound Spellbook', 'Scholar Robes', 'Component Pouch', '2x Mana Draughts'],
    startingGold: 40
  },
  {
    id: 'Rogue',
    name: 'Rogue',
    hitDie: 8,
    baseHp: 8,
    primaryStat: 'DEX',
    subtitle: 'Shadowblade & Infiltrator',
    description: 'A lethal scoundrel specializing in stealth, precision sneak attacks, and disarming traps.',
    abilities: ['Sneak Attack (extra damage on DEX checks)', 'Cunning Action (dash/disengage as bonus)', 'Thieves Cant'],
    defaultInventory: ['Twin Rapier & Dagger', 'Supple Leather Armor', 'Thieves Tools', 'Grappling Hook & Silk Rope', 'Smoke Pellet'],
    startingGold: 50
  },
  {
    id: 'Cleric',
    name: 'Cleric',
    hitDie: 8,
    baseHp: 8,
    primaryStat: 'WIS',
    subtitle: 'Vessel of Divine Might',
    description: 'A holy crusader channeling the wrath and healing light of celestial pantheons.',
    abilities: ['Healing Word (restore 1d8+WIS HP)', 'Turn Undead (repel fiends & ghouls)', 'Sacred Flame'],
    defaultInventory: ['Blessed Warhammer', 'Embossed Sun Shield', 'Scale Mail', 'Holy Symbol Medallion', '2x Healing Salves'],
    startingGold: 30
  },
  {
    id: 'Bard',
    name: 'Bard',
    hitDie: 8,
    baseHp: 8,
    primaryStat: 'CHA',
    subtitle: 'Weaver of Lore & Song',
    description: 'An inspiring performer and diplomat whose music bends fate, charms foes, and bolsters allies.',
    abilities: ['Bardic Inspiration (add d6 bonus to ally rolls)', 'Vicious Mockery (psychic insult)', 'Jack of All Trades'],
    defaultInventory: ['Fine Rosewood Lute', 'Ornate Silver Rapier', 'Studded Velvet Vest', 'Diplomatic Seal', 'Bottle of Vintage Wine'],
    startingGold: 60
  },
  {
    id: 'Ranger',
    name: 'Ranger',
    hitDie: 10,
    baseHp: 10,
    primaryStat: 'DEX',
    subtitle: 'Warden of Wilderness & Hunt',
    description: 'A hunter and tracker attuned to the wild, wielding deadly bows and tracking deadly beasts.',
    abilities: ['Hunters Mark (track and deal bonus damage)', 'Natural Explorer (ignore terrain penalties)', 'Deadeye Shot'],
    defaultInventory: ['Recurve Longbow', 'Quiver of 30 Broadhead Arrows', 'Hunting Knife', 'Camouflage Cloak', 'Beast Snare'],
    startingGold: 35
  },
  {
    id: 'Paladin',
    name: 'Paladin',
    hitDie: 10,
    baseHp: 10,
    primaryStat: 'STR',
    subtitle: 'Knight of Sacred Oaths',
    description: 'A righteous warrior bound by sacred oaths, smiting evil with radiant fury.',
    abilities: ['Divine Smite (infuse weapon with radiant burst)', 'Lay on Hands (pool of healing touch)', 'Aura of Protection'],
    defaultInventory: ['Greatsword of the Order', 'Polished Steel Plate', 'Holy Relic Censer', 'Tabard of Valor', 'Healing Potion'],
    startingGold: 45
  },
  {
    id: 'Barbarian',
    name: 'Barbarian',
    hitDie: 12,
    baseHp: 12,
    primaryStat: 'STR',
    subtitle: 'Primal Champion of Fury',
    description: 'A savage juggernaut fueled by primal rage, shrugging off mortal wounds with fury.',
    abilities: ['Rage (advantage on STR checks, resist physical damage)', 'Unarmored Defense', 'Reckless Attack'],
    defaultInventory: ['Massive Double-Edged Greataxe', 'Handaxes (x2)', 'Bear Fur Mantle', 'Tribal Totem', 'Flint & Steel'],
    startingGold: 25
  }
];

export const POINT_BUY_COSTS = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
};

export const RACE_APPEARANCE_TRAITS = {
  human: 'Determined human with weathered adventurous features, keen focused gaze',
  elf: 'Graceful High Elf with pointed ears, luminous almond eyes, elegant features and silver-threaded hair',
  dwarf: 'Stout, broad-shouldered Mountain Dwarf with a richly braided beard and locks, iron clasp beads, and stone-hewn resilience',
  halfling: 'Nimble Lightfoot Halfling with curly hair, bright curious hazel eyes, and nimble light-footed stance',
  tiefling: 'Striking Tiefling with sweeping ram-like horns, exotic ember-glowing irises, sharp fangs, and a sinuous tail',
  dragonborn: 'Towering Dragonborn with iridescent scales, sweeping reptilian crest horns, and smoldering amber eyes',
  half_orc: 'Muscular Half-Orc with prominent lower canines, battle-earned facial scars, and intense piercing gaze'
};

export const CLASS_APPEARANCE_TRAITS = {
  Fighter: 'clad in interlocking steel plate armor, battle-tested pauldrons, a heavy shield, and a broadsword sheathed at the hip',
  Wizard: 'draped in deep sapphire arcane robes embroidered with starry constellations, clutching an illuminated crystal focus staff',
  Rogue: 'wearing form-fitting dark leather armor, a shadowy hooded cowl, soft boots, and twin concealed stiletto daggers',
  Cleric: 'donning radiant bronze breastplate bearing a holy sun talisman, wielding a consecrated warhammer with glowing divine etchings',
  Bard: 'dressed in a flamboyant silk doublet with plumed hat, carrying an ornate rosewood lute and a jewel-pommeled rapier',
  Ranger: 'wearing a forest-camo mantle, bracers of hardened leather, with a yew recurve bow and feather-fletched quiver strapped to the back',
  Paladin: 'gleaming in polished consecrated plate armor with a white heraldic tabard, resting a hand on an ancient runic greatsword',
  Barbarian: 'bearing fierce tribal war paint across exposed muscular shoulders, draped in heavy wolf pelts, wielding a massive greataxe'
};

export const TOTAL_POINT_BUY_POINTS = 27;

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const RANDOM_APPEARANCES = [
  'Broad-shouldered veteran with battle-scarred cheek, braided dark hair, wearing engraved iron pauldrons and fur mantle',
  'Lean agile figure in a hooded midnight cloak, keen amber eyes watching from the gloom, leather bandolier with throwing daggers',
  'Mystical scholar in deep sapphire and gold-trimmed robes, floating runic rings, clutching a glowing crystal staff',
  'Stoic holy warrior in polished bronze breastplate, wearing a sun-etched medallion, eyes radiating a warm golden spiritual halo',
  'Dashing performer with a plumed cap, intricate rosewood lute slung across back, charming smile and sharp rapier at hip',
  'Weather-beaten scout with sharp green eyes, hood pulled low, clutching a yew recurve bow with feathers woven into braids',
  'Imposing armored paladin with gilded silver tabard, solemn gaze, glowing runic broadsword resting on the table',
  'Towering warrior with braided war-paint, heavy pelt cloak, scarred knuckles, and an enormous stone-cleaving battleaxe',
  'Elven sorcerer with silver hair tied in high braids, glowing violet eyes, obsidian robes adorned with constellation charms',
  'Cunning tiefling rogue with curling obsidian horns, sharp pointed tail, midnight duster, and a pair of serrated stilettos'
];

export const RANDOM_BACKSTORIES = [
  'A former castle sentinel who laid down their post after a fateful encounter in the shadowwoods, now seeking redemption and coin at The Wayward Flagon.',
  'An exile from the High Towers of Arcanum, pursuing ancient whispers of a forgotten relic buried beneath the sunken catacombs.',
  'A devoted wandering acolyte tasked by their temple elder to investigate anomalous planar rifts opening along the frontier trade roads.',
  'A disgraced court poet and duelist framed for treason, traveling the backcountry taverns to clear their family honor with steel and verse.',
  'The sole surviving scout of a frontier expedition, returning with maps of goblin-infested ruins and a hunger for vengeance.'
];

export function getDynamicAppearance(raceId = 'human', classId = 'Fighter') {
  const raceDesc = RACE_APPEARANCE_TRAITS[raceId] || RACE_APPEARANCE_TRAITS.human;
  const classDesc = CLASS_APPEARANCE_TRAITS[classId] || CLASS_APPEARANCE_TRAITS.Fighter;
  return `${raceDesc}, ${classDesc}.`;
}

export const RACE_ORIGIN_THEMES = {
  human: 'Raised on the unpredictable frontier of the mortal kingdoms where resourcefulness is the key to survival',
  elf: 'Trained for centuries within the secluded starlight sanctums of the High Elven kingdoms',
  dwarf: 'Born into the ancestral stone halls and deep iron foundries of the mountain clans',
  halfling: 'Hailing from the sun-dappled hills of the riverlands, driven by an insatiable curiosity for the wider world',
  tiefling: 'Marked by an infernal heritage that taught you to survive prejudice through wit, steel, and fierce independence',
  dragonborn: 'Schooled in the ancient martial traditions and clan honor of the dragon-blooded legions',
  half_orc: 'Forged between two worlds, having earned every scar and victory through indomitable physical resilience'
};

export const CLASS_ORIGIN_MOTIVATIONS = {
  Fighter: 'you honed your blade as a mercenary and castle sentinel, now answering the call of legendary bounties at The Wayward Flagon.',
  Wizard: 'you set out into the realm to uncover forgotten arcane grimoires and investigate planar anomalies.',
  Rogue: 'you made a daring escape from corrupt city syndicates, seeking lucrative dungeon scores and trusted allies.',
  Cleric: 'ordained by your deity to bring radiant salvation and purge the undead scourge from defiled tombs.',
  Bard: 'you wander the realm weaving blood and triumph into ballads that will echo across taverns for generations.',
  Ranger: 'you stalk the frontier trails protecting outposts from beast incursions and tracking ancient monsters.',
  Paladin: 'bound by a sacred oath of radiance, you march wherever evil threatens to overwhelm the defenseless.',
  Barbarian: 'you channel the untamed fury of the primal wildlands, seeking worthy adversaries to test your might.'
};

export function getDynamicBackstory(raceId = 'human', classId = 'Fighter') {
  const origin = RACE_ORIGIN_THEMES[raceId] || RACE_ORIGIN_THEMES.human;
  const motivation = CLASS_ORIGIN_MOTIVATIONS[classId] || CLASS_ORIGIN_MOTIVATIONS.Fighter;
  return `${origin}, ${motivation}`;
}

export const FANTASY_NAMES = {
  human: {
    firstNames: [
      'Alden', 'Cedric', 'Roland', 'Valen', 'Lucian', 'Kenneth', 'Kael', 'Brandon',
      'Elena', 'Lyra', 'Miranda', 'Genevieve', 'Rosalind', 'Teresa', 'Corin', 'Darian'
    ],
    surnames: [
      'of Riverbend', 'Ironforge', 'Stormwind', 'Blackwood', 'Hawthorn', 'Vance',
      'Winterfell', 'Oakheart', 'Silverhand', 'Ravencrest', 'Ashford', 'Valerius'
    ]
  },
  elf: {
    firstNames: [
      'Kaelen', 'Valandil', 'Faerand', 'Thalor', 'Aerin', 'Elion', 'Vespera',
      'Sylvia', 'Lyria', 'Aeloria', 'Caelynn', 'Naivara', 'Morwen', 'Erevan', 'Faenor'
    ],
    surnames: [
      'Sunstride', 'Starbreeze', 'Moonwhisper', 'Silverleaf', 'Nightshade',
      'Dawnbringer', 'Whisperwind', 'Evenwood', 'Shadowsong', 'Oakenheel'
    ]
  },
  dwarf: {
    firstNames: [
      'Thorin', 'Grimjaw', 'Balin', 'Thorgar', 'Duergar', 'Korgan', 'Helga',
      'Dagmar', 'Vondra', 'Astrid', 'Brynhild', 'Dain', 'Bror', 'Kraglin'
    ],
    surnames: [
      'Stonebreaker', 'Ironbound', 'Forgehammer', 'Deepdelver', 'Bronzebeard',
      'Rockseeker', 'Anvilbrow', 'Fireforge', 'Coppervein', 'Mountainpeak'
    ]
  },
  halfling: {
    firstNames: [
      'Milo', 'Pippin', 'Meriadoc', 'Corrin', 'Alton', 'Flynn', 'Roscoe',
      'Rosie', 'Marigold', 'Poppy', 'Blossom', 'Tilly', 'Bree', 'Odo', 'Wilmot'
    ],
    surnames: [
      'Bramblefoot', 'Goodbarrel', 'Underhill', 'Quickstep', 'Tealeaf',
      'Greenbottle', 'Butterbur', 'Hilltopple', 'Lightfoot', 'Sweetwater'
    ]
  },
  tiefling: {
    firstNames: [
      'Malakor', 'Valafar', 'Zephyr', 'Akmenos', 'Barakas', 'Damien', 'Criella',
      'Lillith', 'Kallista', 'Sorrow', 'Damakos', 'Ravana', 'Mephistia', 'Nyx'
    ],
    surnames: [
      'Shadowthorn', 'Hellfire', 'Duskborn', 'Netherveil', 'Ashborn',
      'Bloodthorn', 'Grimheart', 'Brimstone', 'Nightfall', 'Sinweaver'
    ]
  },
  dragonborn: {
    firstNames: [
      'Rhogar', 'Torinn', 'Balasar', 'Arjhan', 'Medrash', 'Heskan', 'Sora',
      'Mishann', 'Nala', 'Surina', 'Harann', 'Kriv', 'Patrin', 'Donaar'
    ],
    surnames: [
      'Wyrmfire', 'Flamecrest', 'Scalecleaver', 'Stormdrake', 'Goldclaw',
      'Dragonheart', 'Emberwing', 'Thunderbreath', 'Drakeblood', 'Pyrestrike'
    ]
  },
  half_orc: {
    firstNames: [
      'Grom', 'Thokk', 'Dench', 'Krusk', 'Ront', 'Gash', 'Baggi', 'Vola',
      'Shautha', 'Myev', 'Griselda', 'Urok', 'Morg', 'Brak'
    ],
    surnames: [
      'Ironjaw', 'Skullcrusher', 'Bloodtusk', 'Bonebreaker', 'Thunderfist',
      'Warborn', 'Ravager', 'Grimfang', 'Goretusk', 'Stonesplitter'
    ]
  }
};

export function generateRandomHeroName(raceId = 'human', classId = 'Fighter') {
  const pool = FANTASY_NAMES[raceId] || FANTASY_NAMES.human;
  const first = pool.firstNames[Math.floor(Math.random() * pool.firstNames.length)];
  const last = pool.surnames[Math.floor(Math.random() * pool.surnames.length)];
  return `${first} ${last}`;
}




