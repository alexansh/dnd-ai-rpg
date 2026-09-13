import { NextRequest, NextResponse } from "next/server";
import { processPlayerAction } from "@/lib/ai/dm-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await processPlayerAction({
      playerAction: body.playerAction || "Looks around cautiously",
      currentLocation: body.currentLocation || "Sunken Crypt",
      questStep: body.questStep || "Explore the depths",
      partySummary: body.partySummary || "Adventuring Party",
      recentRollResult: body.recentRollResult,
      inputMode: body.inputMode,
      authorNote: body.authorNote,
      sessionSummary: body.sessionSummary,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /ai/dm error:", error);
    return NextResponse.json({ error: error.message || "Failed to process DM narrative" }, { status: 500 });
  }
}