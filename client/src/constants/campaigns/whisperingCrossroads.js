/**
 * @file whisperingCrossroads.js
 * Premier Vertical Slice Campaign for The Wayward Flagon RPG Engine.
 * Features 3 acts, deep moral dilemmas, companion approval splits, skill checks, and multiple endings.
 */

export const WHISPERING_CROSSROADS_CAMPAIGN = {
  id: 'campaign_whispering_crossroads',
  title: 'The Whispering Crossroads',
  subtitle: 'A Tale of Blood Oaths, Deserters, and Iron Law',
  premise: 'Beneath the creaking iron gibbet at the edge of the borderlands, an executioner approaches while a bleeding deserter begs for sanctuary.',
  difficulty: 'Heroic (Standard 5e)',
  recommendedLevel: 'Level 1–3',
  environment: 'crossroads',
  bgImage: '/assets/images/scenery/crossroads.jpg',
  initialMood: 'dungeon_suspense',
  initialIntensity: 3,
  
  description: 'Thick autumn mist clings to the ancient four-way junction known as the Whispering Crossroads. A solitary stone monolith stands at the center, marked with carved runes from the First Age. To the north lies the Covenant Citadel; to the south, the forgotten Sunken Sepulcher.',
  
  mainNemesis: 'Grand Inquisitor Vance of the Iron Covenant',
  
  majorFactions: [
    { name: 'The Iron Covenant', disposition: 'Wary / Demanding', goal: 'Ruthlessly capture all deserters and enforce martial order' },
    { name: 'The Ashen Fugitives', disposition: 'Desperate / Indebted', goal: 'Survive the Covenant purge and escape beyond the border' }
  ],

  // 3-Act Narrative Arc with 3 Branching Endings
  acts: [
    { act: 1, name: 'Act I: The Crossroads Parley', objective: 'Decide the fate of Corvin the Deserter before the inquisitor strikes' },
    { act: 2, name: 'Act II: The Shadows Deepen', objective: 'Infiltrate either the Covenant Outpost or the Sunken Sepulcher' },
    { act: 3, name: 'Act III: The Reckoning at Black Rock', objective: 'Confront Inquisitor Vance and shape the destiny of the borderlands' }
  ],

  endings: [
    {
      id: 'ending_shield_of_the_merciful',
      title: 'Shield of the Merciful',
      condition: 'corvin_saved && covenant_purged',
      description: 'The fugitives established a free sanctuary in the high hills. Sister Thalia hails you as the Beacon of the Frontier.'
    },
    {
      id: 'ending_iron_order',
      title: 'The Iron Sovereign',
      condition: 'inquisitor_allied && order >= 40',
      description: 'With Inquisitor Vance by your side, brutal order was restored to the frontier. Grimjaw proudly wears the Legion\'s seal.'
    },
    {
      id: 'ending_shadow_broker',
      title: 'The Gray Shadow',
      condition: 'inquisitor_tricked && benevolence >= 20',
      description: 'You played both factions against one another, profiting from their blind feud while securing freedom for all.'
    }
  ],

  // Structured Node Graph
  startingNodes: [
    {
      id: 'node_crossroads',
      title: 'The Whispering Crossroads',
      act: 1,
      location: 'The Crossroads Gibbet',
      environment: 'crossroads',
      bgImage: '/assets/images/scenery/crossroads.jpg',
      ambientMood: 'dungeon_suspense',
      sensoryPremise: 'The icy damp of the highlands seeps through your cloak. From behind the mossy milestone, ragged breathing reveals a wounded man clutching a broken dagger. Hoofbeats echo in the mist.',
      unlocked: true,
      visited: true,
      x: 20,
      y: 50,
      connectedTo: ['node_sunken_sepulcher', 'node_covenant_outpost'],
      hotspots: [
        { id: 'hs_gibbet', label: 'Iron Gibbet Cage', type: 'relic', check: 'WIS', dc: 11, inspect: 'Rusted cage swaying in the breeze; ancient warding bones rattle within.' },
        { id: 'hs_milestone', label: 'Runic Milestone', type: 'altar', check: 'INT', dc: 12, inspect: 'Weathered stone carved with directions to Netherese tombs.' },
        { id: 'hs_deserter', label: 'Wounded Deserter (Corvin)', type: 'npc', check: 'WIS', dc: 10, inspect: 'Young soldier bleeding from a crossbow wound, begging for mercy.' }
      ],
      fixedChoices: [
        {
          id: 'choice_shield_corvin',
          label: 'Shield Corvin & Defy the Inquisitor',
          icon: 'Shield',
          type: 'action',
          description: 'Step between the deserter and the approaching hunters. Prepare weapons.',
          targetNodeId: 'node_sunken_sepulcher',
          companionAffinities: { thalia: 15, grimjaw: -10 }
        },
        {
          id: 'choice_surrender_corvin',
          label: 'Hand Corvin Over to Inquisitor Vance',
          icon: 'Coins',
          type: 'action',
          description: 'Deliver the fugitive for the 40 Gold bounty and Covenant favor.',
          targetNodeId: 'node_covenant_outpost',
          companionAffinities: { thalia: -20, grimjaw: 10 }
        },
        {
          id: 'choice_deceive_inquisitor',
          label: '[DECEPTION DC 13] Trick Vance with False Tracks',
          icon: 'Sparkles',
          type: 'check',
          checkAbility: 'CHA',
          checkDc: 13,
          description: 'Feign ignorance and misdirect the inquisitor down the gorge.',
          targetNodeId: 'node_sunken_sepulcher',
          companionAffinities: { thalia: 10, grimjaw: 5 }
        }
      ]
    },
    {
      id: 'node_sunken_sepulcher',
      title: 'The Sunken Sepulcher of Oros',
      act: 2,
      location: 'Subterranean Vaults',
      environment: 'crypt',
      bgImage: '/assets/images/scenery/crypt.jpg',
      ambientMood: 'dungeon_suspense',
      sensoryPremise: 'Brackish water laps against ancient Netherese stone. Glowing fungi illuminate submerged sarcophagi and the remnants of a forgotten ritual altar.',
      unlocked: false,
      visited: false,
      x: 55,
      y: 30,
      connectedTo: ['node_crossroads', 'node_black_rock_citadel'],
      hotspots: [
        { id: 'hs_sarcophagus', label: 'Gilded Sarcophagus', type: 'chest', check: 'STR', dc: 14, inspect: 'Heavy stone lid sealed with lead and arcane silver.' },
        { id: 'hs_altar', label: 'Ember Altar', type: 'altar', check: 'INT', dc: 13, inspect: 'Sacred flame radiating restorative heat.' }
      ],
      fixedChoices: [
        {
          id: 'choice_explore_vault',
          label: 'Plunder the Sarcophagus of the Netherese Lord',
          icon: 'Sparkles',
          type: 'check',
          checkAbility: 'STR',
          checkDc: 14,
          description: 'Pry open the stone tomb to claim ancient relics.',
          companionAffinities: { thalia: -5, grimjaw: 10 }
        },
        {
          id: 'choice_consecrate_altar',
          label: 'Perform Consecration Rite at the Ember Altar',
          icon: 'Shield',
          type: 'action',
          description: 'Channel divine power to cleanse the crypt of necrotic blight.',
          companionAffinities: { thalia: 15, grimjaw: 0 }
        }
      ]
    },
    {
      id: 'node_covenant_outpost',
      title: 'The Iron Covenant Outpost',
      act: 2,
      location: 'Border Garrison',
      environment: 'mountains',
      bgImage: '/assets/images/scenery/mountains.jpg',
      ambientMood: 'combat_epic',
      sensoryPremise: 'Blackened timber palisades bristling with ballistas. War drums thrum as Inquisitor Vance inspects the armored vanguard.',
      unlocked: false,
      visited: false,
      x: 55,
      y: 70,
      connectedTo: ['node_crossroads', 'node_black_rock_citadel'],
      hotspots: [
        { id: 'hs_armory', label: 'Covenant Armory', type: 'chest', check: 'DEX', dc: 13, inspect: 'Racks of masterwork steel broadswords and heavy crossbows.' },
        { id: 'hs_war_table', label: 'War Map & Orders', type: 'altar', check: 'INT', dc: 11, inspect: 'Detailed parchment outlining upcoming border assaults.' }
      ],
      fixedChoices: [
        {
          id: 'choice_accept_bounty',
          label: 'Accept Grand Inquisitor Contract (+50 Gold)',
          icon: 'Coins',
          type: 'action',
          description: 'Pledge swords to hunt the remaining rebel cell in the mountains.',
          companionAffinities: { thalia: -15, grimjaw: 15 }
        },
        {
          id: 'choice_sabotage_ballistas',
          label: '[STEALTH DC 13] Sabotage the Outpost Ballistas',
          icon: 'Zap',
          type: 'check',
          checkAbility: 'DEX',
          checkDc: 13,
          description: 'Sever the tension cords under cover of darkness.',
          companionAffinities: { thalia: 10, grimjaw: -10 }
        }
      ]
    },
    {
      id: 'node_black_rock_citadel',
      title: 'Citadel of Black Rock',
      act: 3,
      location: 'The Climax Summit',
      environment: 'mountains',
      bgImage: '/assets/images/scenery/mountains.jpg',
      ambientMood: 'boss_epic',
      sensoryPremise: 'Thunder crashes against jagged basalt cliffs. Grand Inquisitor Vance stands at the apex of the ruined fortress, blade engulfed in crimson brand.',
      unlocked: false,
      visited: false,
      x: 88,
      y: 50,
      type: 'boss',
      connectedTo: ['node_sunken_sepulcher', 'node_covenant_outpost'],
      hotspots: [
        { id: 'hs_vance', label: 'Grand Inquisitor Vance', type: 'boss', check: 'STR', dc: 15, inspect: 'Armored warlord bearing the Executioner\'s Halberd (AC 16, HP 45).' }
      ],
      fixedChoices: [
        {
          id: 'choice_boss_assault',
          label: 'Direct Assault on Inquisitor Vance',
          icon: 'Swords',
          type: 'action',
          description: 'Sound the charge and engage Vance in tactical combat.'
        },
        {
          id: 'choice_boss_parley',
          label: '[PERSUASION DC 15] Demand Honorable Surrender',
          icon: 'MessageSquare',
          type: 'check',
          checkAbility: 'CHA',
          checkDc: 15,
          description: 'Appeal to Vance\'s martial honor to avert bloodshed.'
        }
      ]
    }
  ]
};
