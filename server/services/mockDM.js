import { advanceWorldState } from './storyEngine.js';
import { matchAndInjectLore, registerNewCodexEntries } from './lorebookService.js';

export function generateMockTurn({
  character,
  companions = [],
  action,
  actionType = 'do',
  quest,
  location,
  checkResult,
  history = [],
  storySummary = '',
  worldState = {}
}) {
  const charName = character?.name || 'Adventurer';
  const charClass = character?.class || 'Warrior';
  const turnIndex = history.filter(h => h.role === 'user').length;
  const companion1 = companions[0] || { name: 'Sister Thalia', class: 'Cleric' };
  const companion2 = companions[1] || { name: 'Grimjaw', class: 'Warrior' };

  // Trigger lorebook keyword matching
  matchAndInjectLore(`${action} ${location} ${quest?.title || ''}`);

  // Handle dice check resolution
  if (checkResult) {
    const { ability, total, dc, isSuccess, isCritSuccess, isCritFail } = checkResult;

    if (isCritSuccess || total >= dc + 5) {
      const response = {
        narration: `A phenomenal display of skill! Rolling a ${total} against DC ${dc}, ${charName} executes the move with breathtaking precision. The obstacle shatters, uncovering a hidden cache of ancient silver coins and revealing a secure passageway ahead.`,
        sceneHint: `A shattered ancient stone archway revealing a gleaming vaulted cache of silver and glowing runic torches.`,
        quickActions: [
          'Advance swiftly down the corridor',
          'Search the cache for magical relics',
          'Listen carefully at the passage exit',
          'Catch your breath and check your gear'
        ],
        check: null,
        hpChange: 0,
        goldChange: 15,
        loot: ['Ancient Silver Ring'],
        location: location || 'Dungeon Vault',
        companionActions: [
          {
            name: companion1.name,
            action: `Chants a prayer of warding over the open archway`,
            dialogue: `"The Light favors our bold advance, ${charName}!"`
          }
        ],
        flagsSet: ['obstacle_cleared', 'cache_uncovered'],
        storyBeat: 'EXPLORATION',
        summaryDelta: `${charName} critically succeeded on a ${ability} check, uncovering a hidden cache.`
      };
      return { ...response, worldState: advanceWorldState(worldState, response) };
    }

    if (isCritFail || total <= dc - 5) {
      const response = {
        narration: `Disaster strikes on the roll of ${total} (DC ${dc}). The ground gives way with a sickening crunch, sending loose masonry tumbling into the gloom. You tumble roughly, absorbing bruising impact as hostile silhouettes stir nearby.`,
        sceneHint: `A collapsed subterranean stone floor with jagged masonry and glowing predator eyes emerging from the shadows.`,
        quickActions: [
          'Scramble up and draw your weapon',
          'Tumble into defensive cover',
          'Cast a protective ward or light',
          'Sound a rallying battlecry'
        ],
        check: null,
        hpChange: -3,
        goldChange: 0,
        loot: [],
        location: location || 'Crumbled Ruins',
        companionActions: [
          {
            name: companion2.name,
            action: `Rushes forward to shield you from falling debris`,
            dialogue: `"Watch your footing! Form up behind my shield!"`
          }
        ],
        flagsSet: ['trap_triggered'],
        storyBeat: 'COMBAT',
        summaryDelta: `${charName} suffered a heavy blow on a failed ${ability} check.`
      };
      return { ...response, worldState: advanceWorldState(worldState, response) };
    }

    if (isSuccess) {
      const response = {
        narration: `Success! With a roll of ${total} meeting the DC ${dc}, your steady hands carry you through. The mechanism clicks open smoothly, disarming the trap and granting safe passage deeper into the sanctuary.`,
        sceneHint: `A disarmed ancient mechanism with open brass gates leading into a torchlit sanctuary.`,
        quickActions: [
          'Step into the inner sanctum',
          'Examine the surrounding runes',
          'Keep your guard high and scout ahead',
          'Signal that the way is clear'
        ],
        check: null,
        hpChange: 0,
        goldChange: 5,
        loot: [],
        location: location || 'Inner Sanctum',
        companionActions: [
          {
            name: companion1.name,
            action: `Scouts the periphery with weapon ready`,
            dialogue: null
          }
        ],
        flagsSet: ['door_opened'],
        storyBeat: 'EXPLORATION',
        summaryDelta: `${charName} succeeded on the ${ability} check to bypass the obstacle.`
      };
      return { ...response, worldState: advanceWorldState(worldState, response) };
    } else {
      const response = {
        narration: `A narrow miss. Your roll of ${total} falls short of the DC ${dc}. The heavy stone scrapes loudly against the wall, alerting hostile sentries in the adjacent hall. A menacing hiss echoes through the archway.`,
        sceneHint: `A shadowy stone corridor echoing with the clamor of scraping armor and alerted dungeon guards.`,
        quickActions: [
          'Ready your weapon for incoming beasts',
          'Back up toward the shadows to hide',
          'Attempt to barricade the doorway',
          'Attempt a diplomatic parley'
        ],
        check: null,
        hpChange: -1,
        goldChange: 0,
        loot: [],
        location: location || 'Contested Hall',
        companionActions: [
          {
            name: companion2.name,
            action: `Braces against the doorway to meet the incoming charge`,
            dialogue: null
          }
        ],
        flagsSet: ['enemies_alerted'],
        storyBeat: 'COMBAT',
        summaryDelta: `${charName} alerted nearby hostiles on a failed check.`
      };
      return { ...response, worldState: advanceWorldState(worldState, response) };
    }
  }

  // Handle free action
  const actLower = (action || '').toLowerCase();

  // Attack / Combat action
  if (actLower.includes('attack') || actLower.includes('strike') || actLower.includes('shoot') || actLower.includes('slash')) {
    const isDex = charClass === 'Rogue' || charClass === 'Ranger';
    const checkAbility = isDex ? 'DEX' : (charClass === 'Mage' ? 'INT' : 'STR');
    const response = {
      narration: `You lunge forward, weapon gleaming in the flickering torchlight, aiming for the creature's exposed flank. The beast rears back with bared fangs, attempting to deflect your ferocious advance.`,
      sceneHint: `A dynamic melee clash between an adventurer party and snarling dungeon beasts in a torchlit stone chamber.`,
      quickActions: [],
      check: {
        ability: checkAbility,
        dc: 12,
        reason: `${charClass} Attack Roll against the menacing foe`
      },
      hpChange: 0,
      goldChange: 0,
      loot: [],
      location,
      companionActions: [
        {
          name: companion2.name,
          action: `Flanks the enemy line with drawn weapons`,
          dialogue: null
        }
      ],
      flagsSet: [],
      storyBeat: 'COMBAT',
      summaryDelta: `${charName} engaged the enemy in melee combat.`
    };
    return { ...response, worldState: advanceWorldState(worldState, response) };
  }

  // General progression beats
  const beats = [
    {
      narration: `The air grows damp and heavy with the scent of ozone and ancient moss as ${charName} and the party venture deeper into ${location || 'the quest area'}. Ahead, twin braziers flare to life with sapphire flames, illuminating an iron-reinforced doorway and a descent into the lower vaults.`,
      sceneHint: `A mysterious dungeon hall with glowing sapphire braziers, iron-banded doors, and ancient carved pillars.`,
      quickActions: [
        'Examine the locked iron door',
        'Descend the stairway with torch in hand',
        'Investigate the sapphire braziers for traps',
        'Listen quietly for approaching footsteps'
      ],
      companionActions: [
        {
          name: companion1.name,
          action: `Examines the glowing runes on the braziers`,
          dialogue: `"These flames burn with old magic. Stay alert."`
        }
      ],
      storyBeat: 'EXPLORATION'
    },
    {
      narration: `A sudden scrape of iron against stone breaks the silence. Roving skirmishers brandishing jagged weapons emerge from behind broken pillar ruins, blocking your advance with malicious intent!`,
      sceneHint: `An ambush by armed skirmishers emerging from broken stone ruins under torchlight.`,
      quickActions: [
        'Draw your weapon and charge the lead skirmisher',
        'Cast a blinding spell or throw dust',
        'Demand their surrender with an intimidating shout',
        'Dodge behind pillars for tactical cover'
      ],
      companionActions: [
        {
          name: companion2.name,
          action: `Unsheathes their blade with a resounding metallic clang`,
          dialogue: `"More vermin. Let's finish this quickly!"`
        }
      ],
      storyBeat: 'COMBAT'
    },
    {
      narration: `The skirmishers scatter into the shadows, leaving behind a heavy brass chest bound in tarnished chains. A faint harmonic hum emanates from the lock, suggesting an intricate tumbler mechanism.`,
      sceneHint: `A heavy brass treasure chest bound in chains sitting in the center of an ancient stone vault.`,
      quickActions: [
        'Pick the lock with thieves tools',
        'Smash the chain with brute force',
        'Channel magical dispelling runes',
        'Carefully search the perimeter for tripwires'
      ],
      companionActions: [
        {
          name: companion1.name,
          action: `Performs a quick field dressing on minor scrapes`,
          dialogue: null
        }
      ],
      storyBeat: 'PUZZLE'
    },
    {
      narration: `Inside the chamber lies the objective of your quest: the gleaming Sunstone Amulet resting on a velvet pedestal, bathed in a gentle shaft of moonlight filtering through a fissure above. The way back to The Wayward Flagon is clear.`,
      sceneHint: `A radiant Sunstone Amulet resting on a moonlit stone pedestal inside an ancient vaulted temple sanctuary.`,
      quickActions: [
        'Claim the Sunstone Amulet and return to the tavern',
        'Inspect the pedestal for pressure plates first',
        'Say a prayer of thanksgiving at the shrine',
        'Search the alcoves for additional bounties'
      ],
      companionActions: [
        {
          name: companion2.name,
          action: `Secures the perimeter with a nod of satisfaction`,
          dialogue: `"A fruitful expedition. Let's return to Barnaby's hearth for a round of ale."`
        }
      ],
      flagsSet: ['objective_secured'],
      storyBeat: 'RESOLUTION'
    }
  ];

  const selected = beats[turnIndex % beats.length];
  const response = {
    narration: selected.narration,
    sceneHint: selected.sceneHint,
    quickActions: selected.quickActions,
    check: null,
    hpChange: 0,
    goldChange: 0,
    loot: [],
    location: location || 'Shadowed Halls',
    companionActions: selected.companionActions,
    flagsSet: selected.flagsSet || [],
    storyBeat: selected.storyBeat,
    summaryDelta: `${charName} progressed further into ${location || 'the quest area'}.`
  };

  return { ...response, worldState: advanceWorldState(worldState, response) };
}
