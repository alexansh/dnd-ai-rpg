import { NextRequest, NextResponse } from "next/server";
import { getSavesDatabase } from "@/lib/db/database";
import { CharacterSaveSlot } from "@/lib/state/useGameStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const db = getSavesDatabase();

    if (id) {
      const save = db.getSaveById(id);
      if (!save) {
        return NextResponse.json({ error: "Save not found" }, { status: 404 });
      }
      return NextResponse.json({ save });
    }

    const saves = db.getAllSaves();
    return NextResponse.json({ saves });
  } catch (error) {
    console.error("[SAVES API ERROR] GET failed:", error);
    return NextResponse.json({ error: "Failed to fetch saves" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getSavesDatabase();

    if (body.save) {
      const save = body.save as CharacterSaveSlot;
      if (!save.id || !save.player) {
        return NextResponse.json({ error: "Malformed save slot payload" }, { status: 400 });
      }
      db.upsertSave(save);
      return NextResponse.json({ success: true, id: save.id });
    }

    if (body.saves && Array.isArray(body.saves)) {
      const saves = body.saves as CharacterSaveSlot[];
      for (const save of saves) {
        if (save.id && save.player) {
          db.upsertSave(save);
        }
      }
      return NextResponse.json({ success: true, count: saves.length });
    }

    return NextResponse.json({ error: "Missing 'save' or 'saves' field" }, { status: 400 });
  } catch (error) {
    console.error("[SAVES API ERROR] POST failed:", error);
    return NextResponse.json({ error: "Failed to persist save" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";
    const db = getSavesDatabase();

    if (clearAll) {
      db.clearAllSaves();
      return NextResponse.json({ success: true, message: "All saves cleared" });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing 'id' query parameter" }, { status: 400 });
    }

    const deleted = db.deleteSave(id);
    return NextResponse.json({ success: deleted, id });
  } catch (error) {
    console.error("[SAVES API ERROR] DELETE failed:", error);
    return NextResponse.json({ error: "Failed to delete save" }, { status: 500 });
  }
}
