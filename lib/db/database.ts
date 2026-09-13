import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { CharacterSaveSlot } from "../state/useGameStore";

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "flagon_saves.db");

class SavesDatabase {
  private db: DatabaseSync | null = null;

  constructor(dbPath: string = DB_PATH) {
    this.init(dbPath);
  }

  public init(dbPath: string = DB_PATH): void {
    if (this.db) return;
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS character_saves (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        race TEXT NOT NULL,
        class_name TEXT NOT NULL,
        level INTEGER NOT NULL,
        current_act INTEGER NOT NULL,
        current_location TEXT NOT NULL,
        current_objective TEXT NOT NULL,
        ambiance TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_played TEXT NOT NULL,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_last_played ON character_saves(last_played DESC);
    `);
  }

  private getDb(): DatabaseSync {
    if (!this.db) {
      this.init();
    }
    return this.db!;
  }

  public getAllSaves(): CharacterSaveSlot[] {
    const db = this.getDb();
    const query = db.prepare(`SELECT data FROM character_saves ORDER BY last_played DESC`);
    const rows = query.all() as Array<{ data: string }>;
    return rows.map((row) => JSON.parse(row.data) as CharacterSaveSlot);
  }

  public getSaveById(id: string): CharacterSaveSlot | null {
    const db = this.getDb();
    const query = db.prepare(`SELECT data FROM character_saves WHERE id = ?`);
    const row = query.get(id) as { data: string } | undefined;
    if (!row) return null;
    return JSON.parse(row.data) as CharacterSaveSlot;
  }

  public upsertSave(slot: CharacterSaveSlot): void {
    const db = this.getDb();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO character_saves (
        id, name, race, class_name, level,
        current_act, current_location, current_objective, ambiance,
        created_at, last_played, data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      slot.id,
      slot.player.name,
      slot.player.race,
      slot.player.className,
      slot.player.level,
      slot.currentAct,
      slot.currentLocation,
      slot.currentObjective,
      slot.ambiance,
      slot.createdAt,
      slot.lastPlayed,
      JSON.stringify(slot)
    );
  }

  public deleteSave(id: string): boolean {
    const db = this.getDb();
    const stmt = db.prepare(`DELETE FROM character_saves WHERE id = ?`);
    const result = stmt.run(id);
    return Number(result.changes) > 0;
  }

  public clearAllSaves(): void {
    const db = this.getDb();
    db.exec(`DELETE FROM character_saves`);
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Global singleton instance for server runtime
declare global {
  // eslint-disable-next-line no-var
  var __flagonDb: SavesDatabase | undefined;
}

export const getSavesDatabase = (): SavesDatabase => {
  if (!global.__flagonDb) {
    global.__flagonDb = new SavesDatabase();
  }
  return global.__flagonDb;
};

export { SavesDatabase };
