import { computeAssetHash, deriveSeedFromHash, getAsset, storeAssetBuffer, fetchAndStoreRemoteImage } from './assetRegistry.js';

const SCENE_STYLE_SUFFIX = 'wide-angle cinematic fantasy environment concept art, matte painting, atmospheric perspective, muted amber and umber palette, 8k masterpiece, no text, no characters, no ui';

export function getLocalSceneFallback(location = '') {
  const loc = (location || '').toLowerCase();
  if (loc.includes('crypt') || loc.includes('tomb') || loc.includes('catacomb') || loc.includes('dungeon') || loc.includes('sepulcher') || loc.includes('cellar')) {
    return '/assets/images/scenery/crypt.jpg';
  }
  if (loc.includes('forest') || loc.includes('wood') || loc.includes('grove') || loc.includes('tree')) {
    return '/assets/images/scenery/forest.jpg';
  }
  if (loc.includes('cove') || loc.includes('cave') || loc.includes('sea') || loc.includes('shore')) {
    return '/assets/images/scenery/cove.jpg';
  }
  if (loc.includes('mountain') || loc.includes('peak') || loc.includes('caldera') || loc.includes('volcano')) {
    return '/assets/images/scenery/mountains.jpg';
  }
  if (loc.includes('castle') || loc.includes('fort') || loc.includes('citadel') || loc.includes('rampart') || loc.includes('keep')) {
    return '/assets/images/scenery/castle.jpg';
  }
  if (loc.includes('swamp') || loc.includes('mire') || loc.includes('bog')) {
    return '/assets/images/scenery/swamp.jpg';
  }
  return '/assets/images/scenery/tavern.jpg';
}

export async function generateSceneImage({ sceneDescription = '', location = 'The Wayward Flagon', mood = 'calm' }) {
  const cleanDesc = sceneDescription.trim() || `The ancient stone corridors of ${location}`;
  const prompt = `${cleanDesc}, ${location}, ${mood} lighting, ${SCENE_STYLE_SUFFIX}`;
  const localFallbackUrl = getLocalSceneFallback(location);
  
  // 1. Content-addressed identity check
  const assetId = computeAssetHash('scene', prompt, { location, mood });
  const cached = await getAsset(assetId);
  if (cached) {
    return {
      imageUrl: cached.url,
      fallbackUrl: localFallbackUrl,
      isFallback: false,
      promptUsed: prompt,
      assetId,
      cached: true
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Tier 1: Imagen 3 API if GEMINI_API_KEY is configured
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: '16:9' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const base64 = data.predictions?.[0]?.bytesBase64Encoded;
        if (base64) {
          const buffer = Buffer.from(base64, 'base64');
          const stored = await storeAssetBuffer(assetId, buffer, {
            type: 'scene',
            prompt,
            metadata: { location, mood, provider: 'imagen-3' }
          });
          return {
            imageUrl: stored.url,
            fallbackUrl: localFallbackUrl,
            isFallback: false,
            promptUsed: prompt,
            assetId
          };
        }
      }
    } catch (e) {
      console.warn('[Scene Image Engine] Imagen API not reachable, trying Pollinations:', e.message);
    }
  }

  // 3. Tier 2: Pollinations AI flux model (16:9 wide aspect ratio) with deterministic seed
  try {
    const seed = deriveSeedFromHash(assetId);
    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=896&height=504&nologo=true&seed=${seed}&model=flux`;

    const stored = await fetchAndStoreRemoteImage(assetId, pollinationsUrl, {
      type: 'scene',
      prompt,
      metadata: { location, mood, seed, provider: 'pollinations' }
    });

    return {
      imageUrl: stored.url,
      fallbackUrl: localFallbackUrl,
      isFallback: false,
      promptUsed: prompt,
      assetId
    };
  } catch (err) {
    console.warn('[Scene Image Engine] Error generating scene art:', err.message);
  }

  // 4. Tier 3: Local aesthetic landscape fallback
  return {
    imageUrl: localFallbackUrl,
    fallbackUrl: localFallbackUrl,
    isFallback: true,
    promptUsed: prompt,
    assetId
  };
}
