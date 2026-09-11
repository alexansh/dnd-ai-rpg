export const ARCHETYPES = [
  {
    id: 'Warrior',
    name: 'Warrior',
    subtitle: 'Vanguard of Iron & Steel',
    description: 'A battle-hardened protector capable of absorbing heavy blows and delivering crushing melee strikes.',
    stats: { STR: 16, DEX: 12, CON: 15, INT: 10, WIS: 12, CHA: 10 },
    hp: 28,
    maxHp: 28,
    gold: 35,
    inventory: ['Steel Longsword', 'Heavy Round Shield', 'Chainmail Armor', 'Minor Healing Potion', 'Whetstone'],
    abilities: ['Shield Bash (DEX check to stun)', 'Second Wind (+6 HP once per battle)', 'Cleave'],
    defaultAppearance: 'Broad-shouldered veteran with battle-scarred cheek, braided dark hair, wearing engraved iron pauldrons and fur mantle',
    portraitUrl: '/assets/images/archetypes/warrior.svg',
    color: '#8a1c14'
  },
  {
    id: 'Rogue',
    name: 'Rogue',
    subtitle: 'Shadowblade & Scoundrel',
    description: 'A master of stealth, precision strikes, lockpicking, and uncovering hidden traps in forgotten dungeons.',
    stats: { STR: 10, DEX: 17, CON: 12, INT: 14, WIS: 13, CHA: 14 },
    hp: 20,
    maxHp: 20,
    gold: 50,
    inventory: ['Twin Shadow Daggers', 'Leather Jerkin', 'Thieves Tools', 'Smoke Pellet', 'Lockpick Set'],
    abilities: ['Sneak Attack (extra crit on DEX checks)', 'Evasion (halve trap damage)', 'Pickpocket'],
    defaultAppearance: 'Lean agile figure in a hooded dark cloak, keen amber eyes watching from the gloom, leather bandolier with throwing daggers',
    portraitUrl: '/assets/images/archetypes/rogue.svg',
    color: '#2d472c'
  },
  {
    id: 'Mage',
    name: 'Mage',
    subtitle: 'Weaver of Arcane Aether',
    description: 'A scholar of ancient incantations, commanding devastating elemental spells and revealing magical mysteries.',
    stats: { STR: 8, DEX: 13, CON: 11, INT: 17, WIS: 14, CHA: 12 },
    hp: 16,
    maxHp: 16,
    gold: 40,
    inventory: ['Carved Oak Staff with Focus Crystal', 'Spellbook of the Silver Flame', 'Silk Robes', 'Mana Draught', 'Arcane Component Pouch'],
    abilities: ['Fireball (area INT burst)', 'Mage Armor (boost defense)', 'Arcane Sense (reveal hidden magic)'],
    defaultAppearance: 'Mystical scholar in deep sapphire and gold-trimmed robes, holding a glowing crystal staff, glowing arcane runes etched on hands',
    portraitUrl: '/assets/images/archetypes/mage.svg',
    color: '#4d2d73'
  },
  {
    id: 'Cleric',
    name: 'Cleric',
    subtitle: 'Champion of the Sacred Hearth',
    description: 'A devout crusader channeling holy light to mend wounds, banish undead horrors, and bolster allies.',
    stats: { STR: 14, DEX: 10, CON: 14, INT: 10, WIS: 16, CHA: 13 },
    hp: 24,
    maxHp: 24,
    gold: 30,
    inventory: ['Blessed Warhamer', 'Sanctified Holy Symbol', 'Scale Mail', '2x Greater Healing Potion', 'Incense Censer'],
    abilities: ['Healing Word (+8 HP)', 'Turn Undead (repel fiends with WIS)', 'Radiant Smite'],
    defaultAppearance: 'Stoic holy warrior in polished bronze breastplate, wearing a sun-etched medallion, eyes radiating a warm golden spiritual halo',
    portraitUrl: '/assets/images/archetypes/cleric.svg',
    color: '#d4a574'
  },
  {
    id: 'Bard',
    name: 'Bard',
    subtitle: 'Troubadour of High Lore',
    description: 'A silver-tongued charmer who bends fate, disarms foes with words, and turns any crisis into an epic saga.',
    stats: { STR: 10, DEX: 14, CON: 12, INT: 13, WIS: 11, CHA: 17 },
    hp: 20,
    maxHp: 20,
    gold: 60,
    inventory: ['Rosewood Lute', 'Ornate Rapier', 'Fine Velvet Doublet', 'Elixir of Silver Tongue', 'Feather Quill & Parchment'],
    abilities: ['Bardic Inspiration (bonus to any check)', 'Vicious Mockery (confuse foes)', 'Charming Parley'],
    defaultAppearance: 'Dashing performer with a plumed hat, intricate rosewood lute slung across back, charming smile and sharp rapier at hip',
    portraitUrl: '/assets/images/archetypes/bard.svg',
    color: '#8a4b1e'
  },
  {
    id: 'Ranger',
    name: 'Ranger',
    subtitle: 'Warden of the Untamed Wilds',
    description: 'An expert tracker and marksman who commands the terrain, spot ambushes, and fells beasts from afar.',
    stats: { STR: 12, DEX: 16, CON: 14, INT: 11, WIS: 15, CHA: 9 },
    hp: 22,
    maxHp: 22,
    gold: 35,
    inventory: ['Yew Recurve Bow', 'Quiver of 24 Broadhead Arrows', 'Hunting Knife', 'Studded Leather', 'Antidote Vial'],
    abilities: ['Deadeye Shot (precision DEX attack)', 'Track Beast (WIS check to find secrets)', 'Camouflage'],
    defaultAppearance: 'Weather-beaten scout with sharp green eyes, hood pulled low, clutching a yew recurve bow with feathers woven into braids',
    portraitUrl: '/assets/images/archetypes/ranger.svg',
    color: '#385e38'
  }
];

export function getStatModifier(score = 10) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
