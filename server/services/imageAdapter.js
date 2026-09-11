const STYLE_SUFFIX = 'warm firelit fantasy portrait, painterly digital art, high quality character concept art, muted amber and umber palette, dramatic rim lighting, tavern candlelight glow';

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

export function getLocalArchetypeFallback(characterClass = 'Warrior') {
  const cls = (characterClass || '').toLowerCase();
  if (cls.includes('bard')) return '/assets/images/archetypes/bard.jpg';
  if (cls.includes('cleric') || cls.includes('paladin')) return '/assets/images/archetypes/cleric.jpg';
  if (cls.includes('mage') || cls.includes('wizard') || cls.includes('sorcerer') || cls.includes('warlock')) return '/assets/images/archetypes/mage.jpg';
  if (cls.includes('ranger') || cls.includes('druid')) return '/assets/images/archetypes/ranger.jpg';
  if (cls.includes('rogue') || cls.includes('thief') || cls.includes('monk')) return '/assets/images/archetypes/rogue.jpg';
  return '/assets/images/archetypes/warrior.jpg';
}

export function generateFallbackPortraitSvg(characterClass = 'Warrior', description = '') {
  const classKey = Object.keys(CLASS_ICONS).find(k => (characterClass || '').toLowerCase().includes(k.toLowerCase())) || 'Warrior';
  const icon = CLASS_ICONS[classKey] || CLASS_ICONS.Warrior;

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
        <feGaussianBlur stdDeviation="6" result="blur" />
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
    
    <!-- Face glow highlight -->
    <ellipse cx="200" cy="175" rx="36" ry="46" fill="#3a1c0e" opacity="0.9" />
    <path d="M185 160 Q200 150 215 160 Q200 170 185 160" fill="none" stroke="#f0c987" stroke-width="1.5" opacity="0.6"/>

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

    <!-- Class text banner -->
    <rect x="50" y="342" width="300" height="34" rx="4" fill="#140804" stroke="url(#goldBorder)" stroke-width="1.5" />
    <text x="200" y="364" text-anchor="middle" fill="#f0c987" font-family="Cinzel, Georgia, serif" font-size="14" font-weight="bold" letter-spacing="2">
      ${characterClass.toUpperCase()}
    </text>
  </svg>
  `.trim();

  // Return reliable Base64 Data URI
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export async function generatePortrait({ characterClass = 'Warrior', description = '' }) {
  const charDesc = (description || 'Intrepid adventurer').trim();
  const prompt = `${charDesc}, ${characterClass} fantasy adventurer, D&D character portrait, masterpiece, highly detailed face and eyes, dramatic rim lighting, tavern candlelight glow, high quality digital concept art`;
  const apiKey = process.env.GEMINI_API_KEY;
  const localFallbackUrl = getLocalArchetypeFallback(characterClass);

  // 1. If Gemini API key is configured, attempt official Imagen 3 API
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: '1:1' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const b64 = data.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          return {
            imageUrl: `data:image/jpeg;base64,${b64}`,
            fallbackUrl: localFallbackUrl,
            promptUsed: prompt,
            isFallback: false
          };
        }
      }
    } catch (e) {
      console.warn('[Image Engine] Error calling Imagen API:', e.message);
    }
  }

  // 2. Generate live AI character art via Pollinations AI (free, instant, no key needed)
  try {
    const randomSeed = Math.floor(Math.random() * 1000000);
    const cleanPrompt = prompt.replace(/[^\w\s,.-]/gi, ' ').replace(/\s+/g, ' ').trim();
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const aiImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${randomSeed}&model=flux&enhance=true`;

    return {
      imageUrl: aiImageUrl,
      fallbackUrl: localFallbackUrl,
      promptUsed: prompt,
      isFallback: false
    };
  } catch (err) {
    console.warn('[Image Engine] Fallback to local image/SVG:', err);
  }

  // 3. Graceful offline fallback
  return {
    imageUrl: localFallbackUrl || generateFallbackPortraitSvg(characterClass, description),
    fallbackUrl: localFallbackUrl,
    promptUsed: prompt,
    isFallback: true
  };
}

