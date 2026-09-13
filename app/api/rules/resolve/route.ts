import { NextRequest, NextResponse } from "next/server";
import { resolveEngineRequest } from "@/lib/engine/resolver";
import { EngineRequest } from "@/lib/engine/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const request: EngineRequest = body.request || body;

    if (!request || !request.type) {
      return NextResponse.json({ error: "Missing valid EngineRequest payload" }, { status: 400 });
    }

    const result = resolveEngineRequest(request);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/rules/resolve error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resolve engine request" },
      { status: 500 }
    );
  }
}
