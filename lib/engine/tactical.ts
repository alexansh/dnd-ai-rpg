export interface GridPosition {
  x: number;
  y: number;
}

export type CoverType = "none" | "half" | "three_quarters" | "total";

export interface TacticalNode {
  x: number;
  y: number;
  terrain: "floor" | "water" | "rubble" | "wall" | "pillar" | "crypt_sarcophagus";
  providesCover: CoverType;
  isDifficultTerrain: boolean;
  occupantId?: string;
}

export function calculateDistanceFt(a: GridPosition, b: GridPosition): number {
  // D&D 5e uses Chebyshev distance on 5ft grid: max(dx, dy) * 5
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return Math.max(dx, dy) * 5;
}

export function isWithinRange(a: GridPosition, b: GridPosition, rangeFt: number): boolean {
  return calculateDistanceFt(a, b) <= rangeFt;
}

// Line of Sight via Bresenham algorithm
export function hasLineOfSight(
  start: GridPosition,
  end: GridPosition,
  grid: Record<string, TacticalNode>
): { hasLOS: boolean; cover: CoverType } {
  const points = getLinePoints(start.x, start.y, end.x, end.y);
  
  // Omit start and end
  const intermediates = points.slice(1, -1);
  let highestCover: CoverType = "none";

  for (const p of intermediates) {
    const key = `${p.x},${p.y}`;
    const node = grid[key];
    if (node) {
      if (node.terrain === "wall" || node.providesCover === "total") {
        return { hasLOS: false, cover: "total" };
      }
      if (node.providesCover === "three_quarters") {
        highestCover = "three_quarters";
      } else if (node.providesCover === "half" && highestCover !== "three_quarters") {
        highestCover = "half";
      }
    }
  }

  return { hasLOS: true, cover: highestCover };
}

function getLinePoints(x0: number, y0: number, x1: number, y1: number): GridPosition[] {
  const points: GridPosition[] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currX = x0;
  let currY = y0;

  while (true) {
    points.push({ x: currX, y: currY });
    if (currX === x1 && currY === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currY += sy;
    }
  }

  return points;
}

export function getCoverBonus(cover: CoverType): number {
  switch (cover) {
    case "half":
      return 2; // +2 AC and Dex saves
    case "three_quarters":
      return 5; // +5 AC and Dex saves
    case "total":
      return 999;
    case "none":
    default:
      return 0;
  }
}

export interface TacticalMapLayout {
  width: number;
  height: number;
  nodes: Record<string, TacticalNode>;
  playerSpawns: { x: number; y: number }[];
  companionSpawns: { id: string; x: number; y: number }[];
  enemySpawns: { id: string; monsterKey: string; name: string; x: number; y: number }[];
}