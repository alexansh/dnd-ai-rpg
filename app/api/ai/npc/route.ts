import { NextRequest, NextResponse } from "next/server";
import { getNPCConversation } from "@/lib/ai/npc-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await getNPCConversation({
      npcId: body.npcId || "aldous",
      npcName: body.npcName || "Aldous Fletcher",
      attitude: body.attitude || "wary",
      playerUtterance: body.playerUtterance,
      dialogueHistory: body.dialogueHistory || [],
    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /ai/npc error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate NPC dialogue" }, { status: 500 });
  }
}