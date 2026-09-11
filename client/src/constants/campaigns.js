export const CAMPAIGN_PRESETS = [
  {
    id: 'shadowfell_crypt',
    title: 'The Shadowfell Crypt Incursion',
    subtitle: 'Gothic Dungeon Crawl & Undead Uprising',
    difficulty: 'Challenging',
    recommendedLevel: 'Level 1–4',
    environment: 'crypt',
    bgImage: '/assets/images/scenery/crypt.jpg',
    initialMood: 'dungeon_suspense',
    initialIntensity: 3,
    description: 'Ancient seals deep beneath the graveyard have ruptured. The deathless legions of Lord Morvath stir, choking the catacombs with bone and shadow. Venture into the dark, cleanse the necrotic altars, recruit surviving templars, and destroy the Lich King before his blight spreads across the realm.',
    mainNemesis: 'Lord Morvath the Undying',
    majorFactions: [
      { name: 'Dawn Wardens', disposition: 'Friendly', goal: 'Cleanse the defiled catacombs with holy fire' },
      { name: 'Cult of the Black Veil', disposition: 'Hostile', goal: 'Raise Lord Morvath to ascend as god of shadow' }
    ],
    mainQuest: 'Descend into the crypt depths and sever the necrotic anchor powering Lord Morvath.',
    acts: [
      { act: 1, name: 'Act I: The Ruptured Crypt Gate', objective: 'Secure the graveyard perimeter and enter the sepulcher' },
      { act: 2, name: 'Act II: The Defiled Blood Altar', objective: 'Destroy the necrotic wards and rescue captured paladins' },
      { act: 3, name: 'Act III: The Lich King\'s Throne', objective: 'Confront Lord Morvath and shatter the Soul Phylactery' }
    ],
    startingNodes: [
      {
        id: 'crypt_gate',
        name: 'Ruptured Iron Gates',
        description: 'Crumbling gargoyles and shattered wards lead into the echoing sepulcher.',
        type: 'outpost',
        x: 18,
        y: 50,
        connectedTo: ['ossuary', 'blood_sanctum'],
        unlocked: true
      },
      {
        id: 'ossuary',
        name: 'Forgotten Ossuary',
        description: 'Piles of ancient bones rustle with unnatural life. A caged ally cries out for aid.',
        type: 'dungeon',
        x: 45,
        y: 28,
        connectedTo: ['crypt_gate', 'lich_vault'],
        unlocked: false
      },
      {
        id: 'blood_sanctum',
        name: 'Blood-Altar Sanctum',
        description: 'A defiled shrine to the Sun God dripping with dark ichor and forbidden glyphs.',
        type: 'shrine',
        x: 52,
        y: 72,
        connectedTo: ['crypt_gate', 'lich_vault'],
        unlocked: false
      },
      {
        id: 'lich_vault',
        name: "Lich King's Obsidian Vault",
        description: 'The chilling throne room where Lord Morvath weaves soul-chains and necrotic storms.',
        type: 'boss',
        x: 85,
        y: 52,
        connectedTo: ['ossuary', 'blood_sanctum'],
        unlocked: false
      }
    ],
    companionSpawns: ['thalia', 'grimjaw', 'morwen'],
    hotspots: [
      { id: 'crypt_coffin', label: 'Carved Sarcophagus', type: 'chest', check: 'STR', dc: 12, inspect: 'Heavy stone lid sealed with dried tallow.' },
      { id: 'necrotic_rune', label: 'Glowing Death Glyph', type: 'altar', check: 'INT', dc: 13, inspect: 'Pulsing purple runes written in ancient Netherese.' },
      { id: 'skeleton_vanguard', label: 'Risen Skeleton Guard', type: 'enemy', check: 'DEX', dc: 11, inspect: 'Clattering bones wielding a notched iron scimitar.' }
    ],
    rewardGold: 150,
    rewardItem: 'Sun-Forged Radiance Medallion'
  },
  {
    id: 'wyrmspire_mountains',
    title: 'Crown of the Wyrmspire',
    subtitle: 'High-Altitude Draconic Hunt & Volcanic Peaks',
    difficulty: 'Heroic',
    recommendedLevel: 'Level 2–5',
    environment: 'mountains',
    bgImage: '/assets/images/scenery/mountains.jpg',
    initialMood: 'exploration_wonder',
    initialIntensity: 2,
    description: 'Ash rains over the northern peaks as Vermithrax the Red awakens. The dragon has laid claim to the Dwarven sky-foundries, roasting caravans and hoarding enchanted relics. Climb the jagged crags, recruit hardy hunters, and storm the caldera.',
    mainNemesis: 'Vermithrax the Red Calamity',
    majorFactions: [
      { name: 'Ironpeak Dwarven Clan', disposition: 'Friendly', goal: 'Reclaim their ancestral sky-foundries' },
      { name: 'Draconic Cult of Embers', disposition: 'Hostile', goal: 'Feed towns to the dragon in exchange for fire magic' }
    ],
    mainQuest: 'Ascend Wyrmspire Peak and defeat Vermithrax the Red before the dragon incinerates the lowlands.',
    acts: [
      { act: 1, name: 'Act I: The Howling Crags', objective: 'Ascend the blizzard trails and bypass kobold ambushes' },
      { act: 2, name: 'Act II: The Blazing Foundry', objective: 'Sabotage the dragon cultist blast furnaces and arm ballistas' },
      { act: 3, name: 'Act III: The Caldera Roost', objective: 'Slay Vermithrax atop the volcanic peak and claim the hoard' }
    ],
    startingNodes: [
      {
        id: 'crag_pass',
        name: 'Howling Crag Pass',
        description: 'Narrow cliffside trails whipped by icy gales and sulfur smoke.',
        type: 'outpost',
        x: 15,
        y: 55,
        connectedTo: ['hatchery', 'dwarf_foundry'],
        unlocked: true
      },
      {
        id: 'hatchery',
        name: 'Sulfur Wyrm Hatchery',
        description: 'Volcanic caves guarded by fiery dragon-kin and wyrmling broods.',
        type: 'dungeon',
        x: 42,
        y: 25,
        connectedTo: ['crag_pass', 'caldera_roost'],
        unlocked: false
      },
      {
        id: 'dwarf_foundry',
        name: 'Ruined Sky-Foundry',
        description: 'Ancient dwarven blast furnaces refitted as cultist weapon forges.',
        type: 'ruins',
        x: 55,
        y: 75,
        connectedTo: ['crag_pass', 'caldera_roost'],
        unlocked: false
      },
      {
        id: 'caldera_roost',
        name: "Vermithrax's Roost",
        description: 'A sea of molten gold and scorched bones atop the volcanic caldera.',
        type: 'boss',
        x: 88,
        y: 48,
        connectedTo: ['hatchery', 'dwarf_foundry'],
        unlocked: false
      }
    ],
    companionSpawns: ['zephyr', 'morwen', 'grimjaw'],
    hotspots: [
      { id: 'frozen_chest', label: 'Dwarven Strongbox', type: 'chest', check: 'DEX', dc: 13, inspect: 'Reinforced iron chest half-embedded in volcanic ice.' },
      { id: 'magma_vent', label: 'Active Magma Rift', type: 'hazard', check: 'CON', dc: 12, inspect: 'Scalding geysers spitting embers across the rocky pass.' },
      { id: 'dragon_scout', label: 'Kobold Dragon Priest', type: 'enemy', check: 'WIS', dc: 10, inspect: 'Chanting kobold chanting draconic curses from a ledge.' }
    ],
    rewardGold: 180,
    rewardItem: 'Dragonslayer Greatblade'
  },
  {
    id: 'feywild_court',
    title: 'Whispers of the Feywild Court',
    subtitle: 'Enchanted Realm, Illusions & Archfey Bargains',
    difficulty: 'Normal',
    recommendedLevel: 'Level 1–3',
    environment: 'feywilds',
    bgImage: '/assets/images/scenery/feywilds.jpg',
    initialMood: 'exploration_wonder',
    initialIntensity: 2,
    description: 'The veil between the mortal world and the Gloaming Court has worn thin. Flora glows with phosphorescent light, silver streams flow backwards, and riddles carry deadly curses. Win favor with the Archfey, solve ancient illusions, or succumb to perpetual twilight.',
    mainNemesis: 'Queen Morianna of the Pale Thorn',
    majorFactions: [
      { name: 'Court of Summer Blossoms', disposition: 'Friendly', goal: 'Preserve harmony and trade with mortals' },
      { name: 'The Pale Thorn Unseelie', disposition: 'Hostile', goal: 'Ensnare travelers in endless slumber' }
    ],
    mainQuest: 'Navigate the shimmering court, solve the Archfey riddles, and secure the Starlight Chalice.',
    acts: [
      { act: 1, name: 'Act I: The Phosphor Glade', objective: 'Find a path through the shape-shifting fungal labyrinth' },
      { act: 2, name: 'Act II: The Hall of Reflections', objective: 'Decipher the twilight riddle and break the petrification curse' },
      { act: 3, name: 'Act III: The Summer Pavillion', objective: 'Outwit Queen Morianna and claim the Starlight Chalice' }
    ],
    startingNodes: [
      {
        id: 'glade_entry',
        name: 'Phosphor Glade Threshold',
        description: 'Gigantic glowing mushrooms and spiraling will-o-wisps guide your steps.',
        type: 'outpost',
        x: 20,
        y: 50,
        connectedTo: ['pixie_circle', 'twilight_mirror'],
        unlocked: true
      },
      {
        id: 'pixie_circle',
        name: 'Mushroom Ring of Truth',
        description: 'A sacred circle where lies cause flowers to wither into shimmering ash.',
        type: 'shrine',
        x: 48,
        y: 25,
        connectedTo: ['glade_entry', 'archfey_canopy'],
        unlocked: false
      },
      {
        id: 'twilight_mirror',
        name: 'Pool of Reflections',
        description: 'A crystal pond showing alternate realities and hidden illusion passages.',
        type: 'puzzle',
        x: 46,
        y: 75,
        connectedTo: ['glade_entry', 'archfey_canopy'],
        unlocked: false
      },
      {
        id: 'archfey_canopy',
        name: 'Summer Court Pavilion',
        description: 'A breathtaking throne of living brier and shimmering golden sunlight.',
        type: 'boss',
        x: 84,
        y: 50,
        connectedTo: ['pixie_circle', 'twilight_mirror'],
        unlocked: false
      }
    ],
    companionSpawns: ['lyra', 'vaelin', 'thalia'],
    hotspots: [
      { id: 'pixie_shrine', label: 'Fairy Blossom Altar', type: 'altar', check: 'WIS', dc: 11, inspect: 'A vibrant blossoming lotus dripping with sweet glowing nectar.' },
      { id: 'fey_riddle_stone', label: 'Carved Riddle Monolith', type: 'puzzle', check: 'INT', dc: 12, inspect: 'Silver elvish runes shifting in the breeze.' },
      { id: 'brier_satyr', label: 'Mischievous Satyr Bard', type: 'npc', check: 'CHA', dc: 12, inspect: 'Piping a lilting tune with eyes gleaming with mischief.' }
    ],
    rewardGold: 130,
    rewardItem: 'Crown of Whispering Starlight'
  },
  {
    id: 'smugglers_cove',
    title: "The Sunken Pirate's Grotto",
    subtitle: 'Maritime Ruins, Siren Reefs & Cursed Gold',
    difficulty: 'Normal',
    recommendedLevel: 'Level 1–4',
    environment: 'cove',
    bgImage: '/assets/images/scenery/cove.jpg',
    initialMood: 'dungeon_suspense',
    initialIntensity: 2,
    description: 'Tides have pulled back to reveal the Sunken Grotto of Captain Blacktide. Ghostly sirens guard the coral reefs, and shipwrecked undead protect chests filled with cursed doubloons. Uncover the pirate captain’s navigational charts and defeat his phantom crew before high tide.',
    mainNemesis: 'Captain Blacktide the Spectral Corsair',
    majorFactions: [
      { name: 'Port Vanguard Smugglers', disposition: 'Neutral', goal: 'Loot the wreck before it sinks forever' },
      { name: 'The Drowned Fleet', disposition: 'Hostile', goal: 'Drag all living souls into the depths' }
    ],
    mainQuest: 'Recover the Astrolabe of the Tides and defeat Captain Blacktide.',
    acts: [
      { act: 1, name: 'Act I: The Siren Reefs', objective: 'Navigate the shallow coral channels and resist the siren song' },
      { act: 2, name: 'Act II: The Shattered Galleon', objective: 'Breach the sunken hold and recover the captain\'s sea charts' },
      { act: 3, name: 'Act III: The Drowned Vault', objective: 'Vanquish Captain Blacktide before the tide floods the cavern' }
    ],
    startingNodes: [
      {
        id: 'coral_shallows',
        name: 'Siren Coral Reef',
        description: 'Jagged bioluminescent reefs echoing with haunting melodies and salt spray.',
        type: 'outpost',
        x: 18,
        y: 48,
        connectedTo: ['drowned_galleon', 'tide_cavern'],
        unlocked: true
      },
      {
        id: 'drowned_galleon',
        name: 'The Sea Wraith Wreck',
        description: 'A rotting 3-masted warship wedged between twin sea cliffs.',
        type: 'dungeon',
        x: 45,
        y: 22,
        connectedTo: ['coral_shallows', 'blacktide_hold'],
        unlocked: false
      },
      {
        id: 'tide_cavern',
        name: 'Smuggler Tide Hideout',
        description: 'Torchlit caverns smelling of rum, black powder, and briny sea fog.',
        type: 'ruins',
        x: 50,
        y: 75,
        connectedTo: ['coral_shallows', 'blacktide_hold'],
        unlocked: false
      },
      {
        id: 'blacktide_hold',
        name: "Captain's Cursed Cabin",
        description: 'Flooded quarters where the spectral captain guards his cursed treasure chest.',
        type: 'boss',
        x: 86,
        y: 50,
        connectedTo: ['drowned_galleon', 'tide_cavern'],
        unlocked: false
      }
    ],
    companionSpawns: ['vaelin', 'grimjaw', 'lyra'],
    hotspots: [
      { id: 'barnacle_chest', label: 'Barnacle-Crusted Lockbox', type: 'chest', check: 'DEX', dc: 12, inspect: 'Heavy brass chest coated in wet seaweed and rusty hinges.' },
      { id: 'siren_statue', label: 'Siren Sea Maiden Icon', type: 'altar', check: 'WIS', dc: 13, inspect: 'Carved pearl idol that hums with oceanic resonance.' },
      { id: 'skeleton_pirate', label: 'Drowned Buccaneer', type: 'enemy', check: 'STR', dc: 11, inspect: 'Cutlass-wielding skeleton draped in barnacles and tattered rags.' }
    ],
    rewardGold: 140,
    rewardItem: 'Corsair Tide-Caller Compass'
  },
  {
    id: 'infernal_ironhold',
    title: 'The Infernal Siege of Ironhold',
    subtitle: 'Fiendish Wastelands, Brimstone War & Demonic Gates',
    difficulty: 'Heroic',
    recommendedLevel: 'Level 2–5',
    environment: 'mountains',
    bgImage: '/assets/images/scenery/mountains.jpg',
    initialMood: 'combat_epic',
    initialIntensity: 3,
    description: 'Rifts to the Nine Hells have torn open beneath the fortress of Ironhold. Hellhounds prowl the battlements, devilish siege engines pound the iron gates, and General Baalzun weaves blood rifts. Marshal your party, break the siege lines, and seal the gate.',
    mainNemesis: 'General Baalzun the Hell-Forged',
    majorFactions: [
      { name: 'Ironhold Defenders', disposition: 'Friendly', goal: 'Hold the main bastion until planar reinforcements arrive' },
      { name: 'Infernal Vanguard', disposition: 'Hostile', goal: 'Tear down the ward barriers and burn the mortal kingdoms' }
    ],
    mainQuest: 'Infiltrate the burning bastion, shatter the Hellfire Engines, and banish General Baalzun.',
    acts: [
      { act: 1, name: 'Act I: The Burning Trench', objective: 'Breach the outer hellhound trenches and rescue trapped sentinels' },
      { act: 2, name: 'Act II: The Brimstone Forge', objective: 'Disable the demonic siege engines fueling the rift' },
      { act: 3, name: 'Act III: The Obsidian Gate', objective: 'Defeat General Baalzun and seal the Infernal Portal' }
    ],
    startingNodes: [
      {
        id: 'iron_trench',
        name: 'The Scorched Outpost',
        description: 'Barbed barricades overlooking rivers of smoldering brimstone.',
        type: 'outpost',
        x: 18,
        y: 50,
        connectedTo: ['brimstone_forge', 'siege_battery'],
        unlocked: true
      },
      {
        id: 'brimstone_forge',
        name: 'Brimstone Crucible',
        description: 'Infernal anvils hammering hellfire armor and war weapons.',
        type: 'dungeon',
        x: 48,
        y: 28,
        connectedTo: ['iron_trench', 'infernal_gate'],
        unlocked: false
      },
      {
        id: 'siege_battery',
        name: 'Hellfire Catapult Line',
        description: 'Massive demonic war engines lobbing magma projectiles across the walls.',
        type: 'ruins',
        x: 50,
        y: 72,
        connectedTo: ['iron_trench', 'infernal_gate'],
        unlocked: false
      },
      {
        id: 'infernal_gate',
        name: 'The Infernal Rift Gate',
        description: 'A swirling vortex of hellfire where General Baalzun marshals the legion.',
        type: 'boss',
        x: 86,
        y: 50,
        connectedTo: ['brimstone_forge', 'siege_battery'],
        unlocked: false
      }
    ],
    companionSpawns: ['grimjaw', 'morwen', 'zephyr'],
    hotspots: [
      { id: 'hell_anvil', label: 'Hellfire Anvil', type: 'altar', check: 'STR', dc: 13, inspect: 'Pulsing with red-hot fiendish runes.' },
      { id: 'brimstone_coffer', label: 'Brimstone Strongbox', type: 'chest', check: 'DEX', dc: 12, inspect: 'Smoking iron chest protected by minor flame traps.' },
      { id: 'hellhound_pack', label: 'Hellhound Sentry', type: 'enemy', check: 'DEX', dc: 12, inspect: 'Flaming canine with razor teeth sniffing the sulfur winds.' }
    ],
    rewardGold: 175,
    rewardItem: 'Hellfire Bastion Buckler'
  }
];

