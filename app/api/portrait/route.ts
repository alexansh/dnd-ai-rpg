import { NextRequest, NextResponse } from "next/server";
import { portraitRateLimiter, logAiMetrics } from "@/lib/ai/guardrails";

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "local_session";
  const rateLimit = portraitRateLimiter.check(clientIp);

  if (!rateLimit.allowed) {
    logAiMetrics({
      endpoint: "/api/portrait",
      model: "portrait_rate_limiter",
      latencyMs: 0,
      promptChars: 0,
      responseChars: 0,
      status: "rate_limited",
      errorReason: "Portrait generation rate limit exceeded",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const body = await req.json();
    const { race = "Human", characterClass = "Warrior", description = "" } = body;

    const seed = Math.floor(Math.random() * 1000000);
    const prompt = encodeURIComponent(
      `${race} ${characterClass} adventurer, ${description}, warm firelit fantasy portrait, painterly digital art, muted amber and umber palette, dramatic rim lighting, tavern candlelight glow`
    );

    const externalUrl = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true&seed=${seed}&model=flux`;

    // Try fetching with timeout if within rate limits
    if (rateLimit.allowed) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(externalUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          return NextResponse.json({
            url: `data:image/jpeg;base64,${base64}`,
            source: "ai",
            seed,
          });
        }
      } catch (_) {
        // Ignore network timeout and fall through to procedural SVG
      }
    }

    // Procedural SVG fallback
    const raceKey = race.toLowerCase();
    let skinTone = "#d4a574";
    let raceFeature = "";
    if (raceKey.includes("tiefling")) {
      skinTone = "#833246";
      raceFeature = `<path d="M160 135 C130 90 100 70 80 80 C100 115 130 135 150 145" stroke="#fca5a5" stroke-width="7" stroke-linecap="round" fill="none"/>
                     <path d="M240 135 C270 90 300 70 320 80 C300 115 270 135 250 145" stroke="#fca5a5" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    } else if (raceKey.includes("elf")) {
      skinTone = "#f5d0b0";
      raceFeature = `<path d="M165 165 C135 155 120 140 115 130 C125 150 145 165 165 175 Z" fill="#f5d0b0" stroke="#c89b3c"/>
                     <path d="M235 165 C265 155 280 140 285 130 C275 150 255 165 235 175 Z" fill="#f5d0b0" stroke="#c89b3c"/>`;
    } else if (raceKey.includes("dwarf")) {
      skinTone = "#c48a58";
      raceFeature = `<path d="M165 185 C165 285, 185 310, 200 315 C215 310, 235 285, 235 185 Z" fill="#522a15" stroke="#d4a574" stroke-width="1.5"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <radialGradient id="bgG" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#4a2a1b"/><stop offset="100%" stop-color="#0c0e14"/>
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#bgG)"/>
      <path d="M120 380 C120 280, 150 250, 170 230 C150 215, 145 180, 155 145 C165 110, 235 110, 245 145 C255 180, 250 215, 230 230 C250 250, 280 280, 280 380 Z" fill="#181d2a"/>
      <ellipse cx="200" cy="175" rx="36" ry="46" fill="${skinTone}"/>
      ${raceFeature}
      <rect x="12" y="12" width="376" height="376" rx="8" fill="none" stroke="#d4a737" stroke-width="2"/>
      <rect x="40" y="340" width="320" height="36" rx="4" fill="#0c0e14" stroke="#d4a737" stroke-width="1"/>
      <text x="200" y="363" text-anchor="middle" fill="#f0ce6b" font-family="Cinzel, Georgia, serif" font-size="12" font-weight="bold" letter-spacing="2">
        ${race.toUpperCase()} - ${characterClass.toUpperCase()}
      </text>
    </svg>`;

    return NextResponse.json({
      url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      source: "fallback",
      seed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}