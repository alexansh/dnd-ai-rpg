import { computeAssetHash, deriveSeedFromHash, getAsset, storeAssetBuffer, fetchAndStoreRemoteImage } from './assetRegistry.js';

const STYLE_SUFFIX = 'warm firelit fantasy portrait, painterly digital art, muted amber and umber palette, dramatic rim lighting, tavern candlelight glow';

// SVG Palette colors matching theme
const CLASS_ICONS = {
  Warrior: `<path d="M14.5 4l5.5 5.5L8.5 21 3 21 3 15.5 14.5 4z" fill="#d4a574" stroke="#f0c987" stroke-width="2"/><path d="M18 7.5L16.5 6" stroke="#f0c987" stroke-width="2"/>`,
  Fighter: `<path d="M14.5 4l5.5 5.5L8.5 21 3 21 3 15.5 14.5 4z" fill="#d4a574" stroke="#f0c987" stroke-width="2"/><path d="M18 7.5L16.5 6" stroke="#f0c987" stroke-width="2"/>`,
  Barbarian: `<path d="M7 3l4 4-4 4-2-2 2-2-4-4 4-4 2 2-2 2 4 4z M17 3l-4 4 4 4 2-2-2-2 4-4-4-4-2 2 2 2-4 4z" fill="#d4a574" stroke="#f0c987" stroke-width="1.5"/>`,
  Paladin: `<path d="M12 2l8 4v6c0 5.5-3.8 10.7-8 12-4.2-1.3-8-6.5-8-12V6l8-4z" fill="#2b1810" stroke="#f0c987" stroke-width="2"/><path d="M12 7v10M8 11h8" stroke="#f0c987" stroke-width="2" stroke-linecap="round"/>`,
  Rogue: `<path d="M6 18L18 6M6 6l12 12" stroke="#d4a574" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="8" stroke="#f0c987" stroke-width="1.5" fill="none"/>`,
  Mage: `<path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" stroke="#d4a574" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="#2b1810" stroke="#f0c987" stroke-width="2"/>`,
  Wizard: `<path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" stroke="#d4a574" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="#2b1810" stroke="#f0c987" stroke-width="2"/>`,
  Cleric: `<path d="M12 4v16M6 9h12" stroke="#f0c987" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="#d4a574" stroke-width="2" fill="none"/>`,
  Bard: `<path d="M9 18V5l12-2v13" stroke="#f0c987" stroke-width="2"/><circle cx="6" cy="18" r="3" fill="#d4a574"/><circle cx="18" cy="16" r="3" fill="#d4a574"/>`,
  Ranger: `<path d="M4 20L20 4M20 4h-7M20 4v7M9 15l6-6" stroke="#d4a574" stroke-width="2" stroke-linecap="round"/>`
};

export const RACE_PROMPT_DESCRIPTORS = {
  human: 'Human adventurer with determined weathered facial features, rugged skin, focused human eyes',
  elf: 'High Elf adventurer with very long pointed elven ears angled backward, luminous almond eyes, delicate ethereal cheekbones, aristocratic features, silky flowing hair',
  dwarf: 'Mountain Dwarf adventurer with stout broad proportions, a magnificent thick braided beard adorned with runic dwarven iron clasps, heavy stone-hewn brow, rugged weathered cheeks',
  halfling: 'Lightfoot Halfling adventurer with youthful petite facial features, wavy curls, bright curious hazel eyes, cheerful courageous grin, slight nimble build',
  tiefling: 'Tiefling adventurer with striking swept-back curved ram horns protruding from forehead, exotic solid glowing ember irises, sharp feline canines, dusky reddish-purple skin tone',
  dragonborn: 'Dragonborn draconic humanoid with iridescent reptilian scales covering the entire face, sweeping backward-curving horn crest, draconic snout, slit-pupil golden reptilian eyes, no hair, reptilian visage',
  half_orc: 'Half-Orc warrior with prominent lower jaw tusk canines protruding upward past lips, heavy rugged brow, intense piercing eyes, battle-scarred olive-green skin, broad muscular jaw'
};

export function detectRaceKey(race = '', characterClass = '', description = '') {
  const combined = `${race} ${characterClass} ${description}`.toLowerCase();
  if (combined.includes('dragonborn') || combined.includes('draconic')) return 'dragonborn';
  if (combined.includes('tiefling') || combined.includes('infernal')) return 'tiefling';
  if (combined.includes('half-orc') || combined.includes('half_orc') || combined.includes('halforc') || combined.includes(' orc')) return 'half_orc';
  if (combined.includes('dwarf') || combined.includes('dwarven')) return 'dwarf';
  if (combined.includes('elf') || combined.includes('elven')) return 'elf';
  if (combined.includes('halfling')) return 'halfling';
  return 'human';
}

export function generateFallbackPortraitSvg(characterClass = 'Warrior', description = '', race = 'human') {
  const raceKey = detectRaceKey(race, characterClass, description);
  const classKey = Object.keys(CLASS_ICONS).find(k => (characterClass || '').toLowerCase().includes(k.toLowerCase())) || 'Warrior';
  const icon = CLASS_ICONS[classKey] || CLASS_ICONS.Warrior;

  // Race-specific silhouette elements
  let raceElements = '';
  let skinTone = '#3a1c0e';

  if (raceKey === 'tiefling') {
    skinTone = '#4a1525';
    raceElements = `
      <!-- Tiefling Ram Horns -->
      <path d="M165 140 C135 95 110 65 85 75 C70 85 90 115 125 130" stroke="#d4a574" stroke-width="8" stroke-linecap="round" fill="none" />
      <path d="M235 140 C265 95 290 65 315 75 C330 85 310 115 275 130" stroke="#d4a574" stroke-width="8" stroke-linecap="round" fill="none" />
      <!-- Glowing Fiendish Eyes -->
      <circle cx="188" cy="172" r="3.5" fill="#ff7700" filter="url(#candleGlow)" />
      <circle cx="212" cy="172" r="3.5" fill="#ff7700" filter="url(#candleGlow)" />
      <!-- Sharp Fangs -->
      <polygon points="193,192 195,198 197,192" fill="#f0c987" />
      <polygon points="203,192 205,198 207,192" fill="#f0c987" />
    `;
  } else if (raceKey === 'elf') {
    skinTone = '#3d251e';
    raceElements = `
      <!-- Elven Pointed Ears -->
      <polygon points="160,165 105,135 155,180" fill="#3d251e" stroke="#d4a574" stroke-width="1.5" />
      <polygon points="240,165 295,135 245,180" fill="#3d251e" stroke="#d4a574" stroke-width="1.5" />
      <!-- Luminous Almond Eyes -->
      <ellipse cx="188" cy="172" rx="4" ry="2.5" fill="#99f6e4" filter="url(#candleGlow)" />
      <ellipse cx="212" cy="172" rx="4" ry="2.5" fill="#99f6e4" filter="url(#candleGlow)" />
    `;
  } else if (raceKey === 'dwarf') {
    skinTone = '#422216';
    raceElements = `
      <!-- Massive Braided Beard -->
      <path d="M165 185 C165 285, 185 310, 200 315 C215 310, 235 285, 235 185 Z" fill="#522a15" stroke="#d4a574" stroke-width="1.5" />
      <!-- Iron Braiding Clasps -->
      <rect x="194" y="235" width="12" height="6" rx="2" fill="#d4a574" stroke="#8a5a2e" stroke-width="1" />
      <rect x="194" y="265" width="12" height="6" rx="2" fill="#d4a574" stroke="#8a5a2e" stroke-width="1" />
      <!-- Heavy Fur Mantle -->
      <path d="M100 370 Q200 330 300 370" stroke="#683e1e" stroke-width="12" stroke-linecap="round" fill="none" />
    `;
  } else if (raceKey === 'dragonborn') {
    skinTone = '#2e1c12';
    raceElements = `
      <!-- Draconic Horned Crest -->
      <path d="M175 130 C155 85 135 60 110 50 C125 80 150 110 165 132" stroke="#d4a574" stroke-width="6" stroke-linecap="round" fill="none" />
      <path d="M225 130 C245 85 265 60 290 50 C275 80 250 110 235 132" stroke="#d4a574" stroke-width="6" stroke-linecap="round" fill="none" />
      <!-- Draconic Scaled Brow -->
      <path d="M175 160 Q200 145 225 160" stroke="#f0c987" stroke-width="2.5" fill="none" />
      <!-- Reptilian Slit Eyes -->
      <ellipse cx="188" cy="172" rx="3.5" ry="5" fill="#facc15" filter="url(#candleGlow)" />
      <line x1="188" y1="168" x2="188" y2="176" stroke="#000" stroke-width="1.5" />
      <ellipse cx="212" cy="172" rx="3.5" ry="5" fill="#facc15" filter="url(#candleGlow)" />
      <line x1="212" y1="168" x2="212" y2="176" stroke="#000" stroke-width="1.5" />
      <!-- Scaled Snout -->
      <polygon points="196,192 204,192 200,198" fill="#140804" stroke="#d4a574" stroke-width="1" />
    `;
  } else if (raceKey === 'half_orc') {
    skinTone = '#242f21';
    raceElements = `
      <!-- Protruding Lower Tusks -->
      <polygon points="185,194 188,180 192,194" fill="#fef08a" stroke="#8a5a2e" stroke-width="0.8" />
      <polygon points="215,194 212,180 208,194" fill="#fef08a" stroke="#8a5a2e" stroke-width="0.8" />
      <!-- Heavy Brow & Battle Scar -->
      <path d="M175 162 Q200 155 225 162" stroke="#854d0e" stroke-width="3" fill="none" />
      <line x1="182" y1="156" x2="190" y2="174" stroke="#dc2626" stroke-width="1.5" />
    `;
  } else if (raceKey === 'halfling') {
    skinTone = '#3d2519';
    raceElements = `
      <!-- Halfling Curly Hair Silhouette -->
      <circle cx="165" cy="130" r="14" fill="#522a15" />
      <circle cx="185" cy="120" r="16" fill="#522a15" />
      <circle cx="215" cy="120" r="16" fill="#522a15" />
      <circle cx="235" cy="130" r="14" fill="#522a15" />
      <!-- Bright Inquisitive Eyes -->
      <circle cx="188" cy="172" r="3" fill="#f0c987" />
      <circle cx="212" cy="172" r="3" fill="#f0c987" />
    `;
  }

  const raceBadge = (raceKey.replace('_', ' ')).toUpperCase();
  const classBadge = characterClass.toUpperCase();

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#4a2a1b" />
        <stop offset="60%" stop-color="#23130c" />
        <stop offset="100%" stop-color="#0f0704" />
      </radialGradient>
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f0c987" />
        <stop offset="50%" stop-color="#d4a574" />
        <stop offset="100%" stop-color="#8a5a2e" />
      </linearGradient>
      <filter id="candleGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <!-- Background -->
    <rect width="400" height="400" fill="url(#bgGrad)" />

    <!-- Ambient Firelight circles -->
    <circle cx="200" cy="180" r="130" fill="#f0c987" opacity="0.18" filter="url(#candleGlow)" />
    <circle cx="260" cy="240" r="70" fill="#ff7700" opacity="0.12" filter="url(#candleGlow)" />

    <!-- Silhouette Portrait Body -->
    <path d="M120 380 C120 280, 150 250, 170 230 C150 215, 145 180, 155 145 C165 110, 235 110, 245 145 C255 180, 250 215, 230 230 C250 250, 280 280, 280 380 Z" fill="#1a0c06" stroke="#4a2a1b" stroke-width="2"/>
    
    <!-- Face glow highlight with race skin tone -->
    <ellipse cx="200" cy="175" rx="36" ry="46" fill="${skinTone}" opacity="0.95" />
    <path d="M185 160 Q200 150 215 160 Q200 170 185 160" fill="none" stroke="#f0c987" stroke-width="1.5" opacity="0.6"/>

    <!-- Race-Specific Silhouette Anatomy -->
    ${raceElements}

    <!-- Class Emblem Badge in center chest -->
    <g transform="translate(188, 260) scale(1.2)">
      <circle cx="10" cy="10" r="18" fill="#140804" stroke="url(#goldBorder)" stroke-width="1.5" />
      <g transform="translate(-2, -2) scale(0.9)">
        ${icon}
      </g>
    </g>

    <!-- Ornate Frame Border -->
    <rect x="12" y="12" width="376" height="376" rx="8" fill="none" stroke="url(#goldBorder)" stroke-width="3" />
    <rect x="18" y="18" width="364" height="364" rx="6" fill="none" stroke="#683e1e" stroke-width="1" stroke-dasharray="6,4" />
    
    <!-- Corner Ornaments -->
    <polygon points="12,12 35,12 12,35" fill="url(#goldBorder)" />
    <polygon points="388,12 365,12 388,35" fill="url(#goldBorder)" />
    <polygon points="12,388 35,388 12,365" fill="url(#goldBorder)" />
    <polygon points="388,388 365,388 388,365" fill="url(#goldBorder)" />

    <!-- Race & Class text banner -->
    <rect x="40" y="340" width="320" height="36" rx="4" fill="#140804" stroke="url(#goldBorder)" stroke-width="1.5" />
    <text x="200" y="363" text-anchor="middle" fill="#f0c987" font-family="Cinzel, Georgia, serif" font-size="12" font-weight="bold" letter-spacing="2">
      ${raceBadge} • ${classBadge}
    </text>
  </svg>
  `.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export function getLocalArchetypeFallback(characterClass = 'Warrior', race = 'human') {
  const raceKey = detectRaceKey(race, characterClass);
  // If non-human race, provide race-distinctive procedural SVG
  if (raceKey !== 'human') {
    return generateFallbackPortraitSvg(characterClass, '', raceKey);
  }

  const cls = (characterClass || '').toLowerCase();
  if (cls.includes('bard')) return '/assets/images/archetypes/bard.jpg';
  if (cls.includes('cleric') || cls.includes('paladin')) return '/assets/images/archetypes/cleric.jpg';
  if (cls.includes('mage') || cls.includes('wizard') || cls.includes('sorcerer') || cls.includes('warlock')) return '/assets/images/archetypes/mage.jpg';
  if (cls.includes('ranger') || cls.includes('druid')) return '/assets/images/archetypes/ranger.jpg';
  if (cls.includes('rogue') || cls.includes('thief') || cls.includes('monk')) return '/assets/images/archetypes/rogue.jpg';
  return '/assets/images/archetypes/warrior.jpg';
}

export async function generatePortrait({
  race = 'Human',
  characterClass = 'Warrior',
  description = '',
  forceNew = false,
  variation = null
}) {
  const detectedRaceKey = detectRaceKey(race, characterClass, description);
  const raceDesc = RACE_PROMPT_DESCRIPTORS[detectedRaceKey] || RACE_PROMPT_DESCRIPTORS.human;
  const charDesc = (description || '').trim();

  // Combine vivid racial physical traits, player description, and class
  const fullDescription = charDesc ? `${raceDesc}. ${charDesc}` : raceDesc;
  // Shared style-suffix string adhering strictly to GEMINI.md user rule
  const prompt = `${fullDescription}, ${characterClass} adventurer, ${STYLE_SUFFIX}`;
  const localFallbackUrl = getLocalArchetypeFallback(characterClass, detectedRaceKey);

  // 1. Content-addressed identity check (Bypassed if forceNew or variation is provided)
  const assetParams = { characterClass, race: detectedRaceKey };
  if (variation) assetParams.variation = variation;

  const baseAssetId = computeAssetHash('portrait', prompt, assetParams);

  if (!forceNew && !variation) {
    const cachedAsset = await getAsset(baseAssetId);
    if (cachedAsset) {
      return {
        imageUrl: cachedAsset.url,
        fallbackUrl: localFallbackUrl,
        promptUsed: prompt,
        isFallback: false,
        assetId: baseAssetId,
        cached: true
      };
    }
  }

  // 2. Derive seed: If forceNew or variation, generate a fresh unique seed
  const seed = (forceNew || variation)
    ? (variation ? (typeof variation === 'number' ? variation % 1000000 : deriveSeedFromHash(String(variation))) : Math.floor(Math.random() * 1000000))
    : deriveSeedFromHash(baseAssetId);

  const finalAssetId = (forceNew || variation)
    ? computeAssetHash('portrait', prompt, { ...assetParams, seed })
    : baseAssetId;

  // 3. Generate live AI character art via Pollinations AI with seed
  try {
    const cleanPrompt = prompt.replace(/[^\w\s,.-]/gi, ' ').replace(/\s+/g, ' ').trim();
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${seed}&model=flux&enhance=true`;

    const stored = await fetchAndStoreRemoteImage(finalAssetId, aiImageUrl, {
      type: 'portrait',
      prompt,
      metadata: { characterClass, race: detectedRaceKey, seed, provider: 'pollinations' }
    });

    return {
      imageUrl: stored.url,
      fallbackUrl: localFallbackUrl,
      promptUsed: prompt,
      isFallback: false,
      assetId: finalAssetId,
      seed
    };
  } catch (err) {
    console.warn('[Image Engine] Pollinations fetch/store failed, falling back to race-appropriate SVG:', err.message);
  }

  // 4. Graceful offline fallback matching race and class
  return {
    imageUrl: localFallbackUrl || generateFallbackPortraitSvg(characterClass, description, detectedRaceKey),
    fallbackUrl: localFallbackUrl,
    promptUsed: prompt,
    isFallback: true,
    assetId: finalAssetId,
    seed
  };
}

