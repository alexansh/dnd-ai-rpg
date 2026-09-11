export const COMPANIONS_POOL = [
  {
    id: 'thalia',
    name: 'Sister Thalia',
    class: 'Cleric',
    role: 'Healer & Spiritual Sentinel',
    recruited: false,
    approval: 50,
    recruitmentLocation: 'Desecrated Sun Altar',
    recruitmentDialogue: {
      intro: '"Traveler, these grounds are thick with foul curses. My warhammer seeks to purge the unholy, but the dark is vast. Shall we walk the path of dawn together?"',
      acceptChoice: 'Join me, Sister Thalia. Our blades are stronger together.',
      declineChoice: 'I travel alone for now, sister.'
    },
    personality: {
      archetype: 'Devout protector with dry humor',
      trait: 'Quotes obscure temple scriptures at inappropriately tense moments',
      flaw: 'Refuses to let anyone die on her watch, even repentant adversaries',
      bond: 'Sworn by sacred oath to safeguard the party at any personal cost',
      likes: ['Mercy', 'Protecting innocents', 'Holy relics', 'Direct honesty'],
      dislikes: ['Necromancy', 'Greed over lives', 'Betrayal', 'Cruelty']
    },
    stats: { STR: 14, DEX: 10, CON: 14, INT: 10, WIS: 16, CHA: 13 },
    hp: 24,
    maxHp: 24,
    inventory: ['Blessed Warhammer', 'Silver Sun Relic', 'Healing Salve'],
    defaultAppearance: 'Stern holy warrior woman in bronze breastplate with sun-etched medallion, warm golden halo around her eyes',
    portraitUrl: '/assets/images/companions/thalia.jpg',
    color: '#d4a574',
    combatPriority: 'heal_lowest_hp_ally',
    tacticalSkill: {
      name: "Dawn's Guidance",
      description: 'Grants +1d4 bonus to any player ability check or heals 8 HP in crisis.',
      bonus: 3,
      icon: '✨'
    },
    campConversations: [
      {
        id: 'thalia_origin',
        prompt: '"Why did you leave the Grand Monastery to wander these perilous lands?"',
        response: '"The High Prelates prayed in ivory towers while villages burned. Faith without action is an empty chalice. I vowed to bring the light where the dark is deepest."',
        approvalChange: +5,
        approvalFeedback: 'Sister Thalia appreciates your understanding of her sacred duty.'
      },
      {
        id: 'thalia_oath',
        prompt: '"What will you do when our quest reaches its end?"',
        response: '"Build an orphanage in the lowlands, and perhaps teach young squires how to properly swing a heavy warhammer."',
        approvalChange: +3,
        approvalFeedback: 'Sister Thalia smiles warmly at the thought of peace.'
      }
    ],
    banterTriggers: ['ON_CRIT_SUCCESS', 'ON_CRIT_FAIL', 'ON_LOW_HP', 'ON_QUEST_COMPLETE']
  },
  {
    id: 'grimjaw',
    name: 'Grimjaw Ironbound',
    class: 'Warrior',
    role: 'Vanguard Tank & Wall of Iron',
    recruited: false,
    approval: 50,
    recruitmentLocation: 'Ironbound Dungeon Cage / Frontlines',
    recruitmentDialogue: {
      intro: '"Hah! You look like you know which end of a sword to stick into a goblin. I need a crew with guts. You leading, or am I?"',
      acceptChoice: 'Grab your axe, Grimjaw. We have skulls to crack.',
      declineChoice: 'Not today, dwarf. Stay out of my way.'
    },
    personality: {
      archetype: 'Grizzled veteran who despises goblins and subterfuge',
      trait: 'Counts enemy numbers aloud before chopping them down',
      flaw: 'Prone to reckless charges if an ally is threatened',
      bond: 'Carries the broken sigil of his fallen mercenary company',
      likes: ['Direct combat', 'Courage in the face of death', 'Strong mead', 'Honoring fallen warriors'],
      dislikes: ['Cowardice', 'Sneaking around when you could charge', 'Talking too much', 'Treacherous poisons']
    },
    stats: { STR: 17, DEX: 11, CON: 16, INT: 9, WIS: 11, CHA: 10 },
    hp: 30,
    maxHp: 30,
    inventory: ['Heavy Greataxe', 'Iron Bulwark Shield', 'Drying Jerky'],
    defaultAppearance: 'Massive scarred veteran in plate armor, graying braided beard, stern icy-gray eyes',
    portraitUrl: '/assets/images/companions/grimjaw.jpg',
    color: '#8a1c14',
    combatPriority: 'engage_highest_threat',
    tacticalSkill: {
      name: 'Iron Wall Taunt',
      description: 'Absorbs heavy incoming blows and grants advantage on next attack.',
      bonus: 4,
      icon: '🛡️'
    },
    campConversations: [
      {
        id: 'grimjaw_scars',
        prompt: '"Tell me about the broken sigil around your neck, Grimjaw."',
        response: '"The Iron Vanguard. Thirty brothers in arms. We held the mountain pass for three days against the horde... I was the only one who woke up under the corpses. I won\'t fail this company."',
        approvalChange: +5,
        approvalFeedback: 'Grimjaw nods solemnly, respecting your acknowledgment of his fallen.'
      },
      {
        id: 'grimjaw_battle',
        prompt: '"What\'s your strategy for the upcoming dungeon?"',
        response: '"Kick the front gate in, scream our battle cry, and let them try to break through my shield. Subtlety is for rogues who can\'t take a punch."',
        approvalChange: +2,
        approvalFeedback: 'Grimjaw grins fiercely at the prospect of battle.'
      }
    ],
    banterTriggers: ['ON_COMBAT_START', 'ON_CRIT_SUCCESS', 'ON_TAKE_HEAVY_DAMAGE']
  },
  {
    id: 'vaelin',
    name: 'Vaelin Shadowleaf',
    class: 'Rogue',
    role: 'Striker & Lock Specialist',
    recruited: false,
    approval: 50,
    recruitmentLocation: 'Shadowed Alleyway / Smuggler Grotto',
    recruitmentDialogue: {
      intro: '"You step loudly for someone walking through cutthroat territory. Lucky for you, I specialize in quiet solutions and unopened vaults. Split the spoils 50-50 and I\'m your shadow."',
      acceptChoice: 'Deal, Vaelin. Keep your daggers sharp and watch my back.',
      declineChoice: 'I don\'t trust thieves in my camp.'
    },
    personality: {
      archetype: 'Cynical shadowblade with a hidden heart of gold',
      trait: 'Tosses a silver coin whenever assessing a dangerous room',
      flaw: 'Cannot resist checking locked chests even in active combat',
      bond: 'Seeking redemption for a heist gone wrong in the capital',
      likes: ['Clever solutions', 'Disarming traps', 'Big payouts', 'Witty banter'],
      dislikes: ['Blind charges into ambushes', 'Giving away treasure for free', 'Moral grandstanding']
    },
    stats: { STR: 10, DEX: 17, CON: 12, INT: 14, WIS: 13, CHA: 14 },
    hp: 20,
    maxHp: 20,
    inventory: ['Twin Shadow Daggers', 'Masterwork Lockpicks', 'Smoke Pellet'],
    defaultAppearance: 'Slender rogue with hooded cowl, keen violet eyes, midnight leather gear with silver buckles',
    portraitUrl: '/assets/images/companions/vaelin.jpg',
    color: '#2d472c',
    combatPriority: 'flank_vulnerable_foes',
    tacticalSkill: {
      name: 'Master Lockpick & Flank',
      description: 'Automatically unlocks traps/doors or deals +6 critical sneak damage.',
      bonus: 4,
      icon: '🗡️'
    },
    campConversations: [
      {
        id: 'vaelin_heist',
        prompt: '"Who taught you how to pick masterwork locks, Vaelin?"',
        response: '"The Guild of the Black Feather in Neverwinter. They taught me how to take what the nobles hoarded... until they tried to sell me out to the city watch. Now I work for myself—and you, if you keep things interesting."',
        approvalChange: +4,
        approvalFeedback: 'Vaelin smirks, enjoying trading secrets by firelight.'
      }
    ],
    banterTriggers: ['ON_TRAP_FOUND', 'ON_CRIT_SUCCESS', 'ON_LOOT_FOUND']
  },
  {
    id: 'morwen',
    name: 'Archmage Morwen',
    class: 'Mage',
    role: 'Arcane Controller & Historian',
    recruited: false,
    approval: 50,
    recruitmentLocation: 'Runic Monolith / Mana Well',
    recruitmentDialogue: {
      intro: '"The ley lines in this sector are experiencing severe chronological distortion! Fascinating... If you intend to delve into the source of this anomaly, I request permission to observe—and disintegrate any hostile obstacles."',
      acceptChoice: 'Welcome aboard, Morwen. We could use your arcane mastery.',
      declineChoice: 'Magic is too volatile for this journey.'
    },
    personality: {
      archetype: 'Eccentric scholar fascinated by forbidden arcana',
      trait: 'Takes hasty parchment notes while dodging fireballs',
      flaw: 'Overconfident in their ability to counter ancient curses',
      bond: 'Seeking the lost pages of the Codex of Aether',
      likes: ['Uncovering ancient lore', 'Deciphering glyphs', 'Magical artifacts', 'Intelligent problem solving'],
      dislikes: ['Ignorance', 'Destroying relics without studying them', 'Anti-magic zealots']
    },
    stats: { STR: 8, DEX: 12, CON: 11, INT: 17, WIS: 15, CHA: 12 },
    hp: 18,
    maxHp: 18,
    inventory: ['Crystal Stave', 'Runic Spellbook', 'Mana Crystal'],
    defaultAppearance: 'Robed elven arcanist with floating silver runes, glowing blue eyes, ornate starry mantle',
    portraitUrl: '/assets/images/companions/morwen.jpg',
    color: '#4d2d73',
    combatPriority: 'crowd_control_spells',
    tacticalSkill: {
      name: 'Arcane Arc & Lore',
      description: 'Reveals hidden magical secrets or unleashes a 10-damage chain lightning burst.',
      bonus: 5,
      icon: '🔮'
    },
    campConversations: [
      {
        id: 'morwen_codex',
        prompt: '"What is the Codex of Aether you are searching for?"',
        response: '"A pre-Calamity grimoire containing the blueprints of the celestial spheres. Recovering even one fragment could unlock teleportation across dimensions!"',
        approvalChange: +5,
        approvalFeedback: 'Morwen lights up with excitement at your scholarly curiosity.'
      }
    ],
    banterTriggers: ['ON_MAGIC_DETECTED', 'ON_PUZZLE', 'ON_BOSS_ENCOUNTER']
  },
  {
    id: 'lyra',
    name: 'Lyra Nightingale',
    class: 'Bard',
    role: 'Inspiring Support & Negotiator',
    recruited: false,
    approval: 50,
    recruitmentLocation: 'Tavern Stage / Woodland Clearing',
    recruitmentDialogue: {
      intro: '"I sense epic destiny upon your brow, adventurer! Every grand saga needs a chronicler to weave blood and gold into eternal ballads. Shall I tune my mandolin to your triumphant march?"',
      acceptChoice: 'Join our company, Lyra! Sing our legend to the world.',
      declineChoice: 'I prefer quiet travels.'
    },
    personality: {
      archetype: 'Charming troubadour who turns every crisis into an epic ballad',
      trait: 'Improvises rhyming insults at menacing monsters',
      flaw: 'Tends to underestimate how hostile dungeon denizens really are',
      bond: 'Promised to write the definitive saga of your adventures',
      likes: ['Inspiring others', 'Charismatic negotiations', 'Music & storytelling', 'Heroic drama'],
      dislikes: ['Grim silence', 'Unnecessary slaughter', 'Boring solutions']
    },
    stats: { STR: 10, DEX: 14, CON: 12, INT: 13, WIS: 11, CHA: 17 },
    hp: 20,
    maxHp: 20,
    inventory: ['Rosewood Mandolin', 'Fine Rapier', 'Vial of Silver Wine'],
    defaultAppearance: 'Dashing performer with plumed cap, rosewood mandolin, vibrant silk doublet and warm smile',
    portraitUrl: '/assets/images/companions/lyra.jpg',
    color: '#8a4b1e',
    combatPriority: 'inspire_allies_and_distract',
    tacticalSkill: {
      name: 'Bardic Inspiration',
      description: 'Adds +1d6 to any dice roll and boosts party morale.',
      bonus: 4,
      icon: '🪕'
    },
    campConversations: [
      {
        id: 'lyra_ballad',
        prompt: '"What stanza are you writing about our recent battle?"',
        response: '"\'Through fire and ash the Champion stood, with steel unbroken and brotherhood.\' It has a marvelous ring, don\'t you think?"',
        approvalChange: +4,
        approvalFeedback: 'Lyra beams with artistic pride.'
      }
    ],
    banterTriggers: ['ON_CRIT_FAIL', 'ON_SOCIAL_PARLEY', 'ON_QUEST_COMPLETE']
  },
  {
    id: 'zephyr',
    name: 'Zephyr Windstrider',
    class: 'Ranger',
    role: 'Wilderness Scout & Sniper',
    recruited: false,
    approval: 50,
    recruitmentLocation: 'Crag Lookout / Deep Wilds',
    recruitmentDialogue: {
      intro: '"The wind carries the scent of blood and sulfur. Predators are on the prowl. If you are tracking the beast, my bow is steady and my eyes do not miss."',
      acceptChoice: 'Lead the hunt with us, Zephyr.',
      declineChoice: 'We will track on our own.'
    },
    personality: {
      archetype: 'Quiet tracker who speaks only when necessary',
      trait: 'Always notices subtle tracks, scents, and wind shifts first',
      flaw: 'Deeply uncomfortable inside crowded taverns and cities',
      bond: 'Avenging a beast that destroyed his mountain village',
      likes: ['Respecting nature', 'Stealthy approaches', 'Precision strikes', 'Loyalty'],
      dislikes: ['Wasteful destruction', 'Arrogant boasting', 'Noisy towns']
    },
    stats: { STR: 12, DEX: 16, CON: 14, INT: 11, WIS: 16, CHA: 9 },
    hp: 22,
    maxHp: 22,
    inventory: ['Longbow of Yew', 'Hunting Broadheads', 'Beast Trap'],
    defaultAppearance: 'Weathered hunter with camo mantle, sharp hazel eyes, yew longbow strapped to back',
    portraitUrl: '/assets/images/companions/zephyr.jpg',
    color: '#385e38',
    combatPriority: 'deadeye_ranged_sniping',
    tacticalSkill: {
      name: "Hunter's Deadeye",
      description: 'Spots enemy vulnerabilities granting +5 perception and lethal ranged damage.',
      bonus: 5,
      icon: '🏹'
    },
    campConversations: [
      {
        id: 'zephyr_hunt',
        prompt: '"How do you read the tracks in these strange lands?"',
        response: '"The earth never lies. A bent twig, crushed moss, the temperature of ash. Listen to the wind, and it tells you everything the beast wishes to conceal."',
        approvalChange: +5,
        approvalFeedback: 'Zephyr nods with quiet hunter camaraderie.'
      }
    ],
    banterTriggers: ['ON_AMBUSH', 'ON_WILDERNESS_ENTRY', 'ON_CRIT_SUCCESS']
  }
];

export function getApprovalRating(approvalScore = 50) {
  if (approvalScore >= 80) return { label: 'Exceptional', color: 'text-amber-300', icon: '🌟' };
  if (approvalScore >= 60) return { label: 'Favorable', color: 'text-emerald-400', icon: '👍' };
  if (approvalScore >= 40) return { label: 'Neutral', color: 'text-stone-300', icon: '⚖️' };
  if (approvalScore >= 20) return { label: 'Discontent', color: 'text-orange-400', icon: '👎' };
  return { label: 'Hostile', color: 'text-red-500', icon: '⚔️' };
}

export function getComplementaryCompanions(playerClass = 'Warrior') {
  const map = {
    Warrior: ['thalia', 'vaelin'],
    Rogue: ['grimjaw', 'thalia'],
    Mage: ['grimjaw', 'thalia'],
    Cleric: ['grimjaw', 'vaelin'],
    Bard: ['grimjaw', 'morwen'],
    Ranger: ['thalia', 'morwen']
  };

  const companionIds = map[playerClass] || ['thalia', 'vaelin'];
  return COMPANIONS_POOL.filter(c => companionIds.includes(c.id)).map(c => ({
    ...c,
    recruited: true,
    hp: c.maxHp,
    approval: 55,
    isFallen: false
  }));
}
