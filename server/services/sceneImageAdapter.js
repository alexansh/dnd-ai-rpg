const SCENE_STYLE_SUFFIX = 'wide-angle fantasy environment concept art, painterly digital art, muted amber and umber palette, dramatic volumetric lighting, high quality matte painting, atmospheric perspective, no text, no UI';

// In-memory cache: promptHash -> { imageUrl, isFallback, timestamp }
const sceneCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 mins

export async function generateSceneImage({ sceneDescription = '', location = 'Dungeon Vault', mood = 'calm' }) {
  const cleanDesc = sceneDescription.trim() || `The ancient halls of ${location}`;
  const prompt = `${cleanDesc}, ${location}, ${mood} atmosphere, ${SCENE_STYLE_SUFFIX}`;
  const cacheKey = `${location}-${cleanDesc}-${mood}`.toLowerCase();

  // Check cache
  const cached = sceneCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Tier 1: Imagen 3 API if GEMINI_API_KEY is configured
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
          const result = {
            imageUrl: `data:image/jpeg;base64,${base64}`,
            isFallback: false,
            promptUsed: prompt
          };
          sceneCache.set(cacheKey, { data: result, timestamp: Date.now() });
          return result;
        }
      }
    } catch (e) {
      console.warn('[Scene Image Engine] Imagen API not reachable, trying Pollinations:', e.message);
    }
  }

  // 2. Tier 2: Pollinations AI flux model (16:9 wide aspect ratio)
  try {
    const seed = Math.floor(Math.random() * 100000);
    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=896&height=504&nologo=true&seed=${seed}&model=flux`;

    const result = {
      imageUrl: pollinationsUrl,
      isFallback: false,
      promptUsed: prompt
    };
    sceneCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.warn('[Scene Image Engine] Error generating scene art:', err.message);
  }

  // 3. Tier 3: Return null for client gradient fallback
  return {
    imageUrl: null,
    isFallback: true,
    promptUsed: prompt
  };
}
