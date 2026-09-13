import { NextRequest, NextResponse } from "next/server";
import { processPlayerAction } from "@/lib/ai/dm-agent";
import { dmRateLimiter, sanitizePlayerInput, logAiMetrics } from "@/lib/ai/guardrails";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "local_session";

  // Rate Limiting Guardrail
  const rateLimit = dmRateLimiter.check(clientIp);
  if (!rateLimit.allowed) {
    logAiMetrics({
      endpoint: "/api/ai/dm",
      model: "rate_limiter",
      latencyMs: Date.now() - startTime,
      promptChars: 0,
      responseChars: 0,
      status: "rate_limited",
      errorReason: `Rate limit exceeded. Reset in ${Math.round(rateLimit.resetMs / 1000)}s`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        narrative: "The tavern chronicler raises a hand, catching their breath. Give the storyteller a brief moment to ponder before presenting your next deed.",
        currentLocation: "The Wayward Flagon",
        ambiance: "tavern_warm",
        suggestedActions: ["Wait a moment and collect your thoughts", "Review your character sheet", "Check party equipment"],
        pointsOfInterest: [],
        lootEvents: [],
      },
      {
        status: 200, // Return graceful fallback narrative with warning headers
        headers: {
          "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const body = await req.json();

    // Input sanitization & clamping
    const rawAction = body.playerAction || "Looks around cautiously";
    const sanitizedAction = sanitizePlayerInput(rawAction, 1000);
    const sanitizedLocation = sanitizePlayerInput(body.currentLocation || "Sunken Crypt", 120);
    const sanitizedQuest = sanitizePlayerInput(body.questStep || "Explore the depths", 200);

    const result = await processPlayerAction({
      playerAction: sanitizedAction,
      currentLocation: sanitizedLocation,
      questStep: sanitizedQuest,
      partySummary: body.partySummary || "Adventuring Party",
      recentRollResult: body.recentRollResult ? sanitizePlayerInput(body.recentRollResult, 300) : undefined,
      inputMode: body.inputMode,
      authorNote: body.authorNote,
      sessionSummary: body.sessionSummary,
    });

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    });
  } catch (error: any) {
    console.error("API /ai/dm error:", error);
    return NextResponse.json({ error: error.message || "Failed to process DM narrative" }, { status: 500 });
  }
}