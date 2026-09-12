export interface DiceRollDetail {
  die: number;
  sides: number;
  value: number;
  kept: boolean;
}

export interface RollResult {
  notation: string;
  label?: string;
  rolls: DiceRollDetail[];
  modifier: number;
  total: number;
  isNat20: boolean;
  isNat1: boolean;
  isCritical: boolean;
  explanation: string;
}

export function parseDiceNotation(notation: string): {
  count: number;
  sides: number;
  modifier: number;
  keepHighest?: number;
  keepLowest?: number;
} {
  const clean = notation.toLowerCase().replace(/\s+/g, "");

  // Match e.g. 2d20kh1+3 or 1d20-2 or 2d6+4 or d20
  const match = clean.match(/^(\d*)d(\d+)(kh\d+|kl\d+)?([+-]\d+)?$/);
  if (!match) {
    return { count: 1, sides: 20, modifier: 0 };
  }

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const keepModifier = match[3];
  const modifier = match[4] ? parseInt(match[4], 10) : 0;

  let keepHighest: number | undefined;
  let keepLowest: number | undefined;

  if (keepModifier?.startsWith("kh")) {
    keepHighest = parseInt(keepModifier.replace("kh", ""), 10);
  } else if (keepModifier?.startsWith("kl")) {
    keepLowest = parseInt(keepModifier.replace("kl", ""), 10);
  }

  return { count, sides, modifier, keepHighest, keepLowest };
}

export function rollSingleDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function executeRoll(notation: string, label?: string): RollResult {
  const { count, sides, modifier, keepHighest, keepLowest } = parseDiceNotation(notation);

  const rawRolls: { index: number; value: number }[] = [];
  for (let i = 0; i < count; i++) {
    rawRolls.push({ index: i, value: rollSingleDie(sides) });
  }

  // Determine kept dice
  let keptIndices = new Set<number>();
  if (keepHighest !== undefined) {
    const sorted = [...rawRolls].sort((a, b) => b.value - a.value);
    sorted.slice(0, keepHighest).forEach((r) => keptIndices.add(r.index));
  } else if (keepLowest !== undefined) {
    const sorted = [...rawRolls].sort((a, b) => a.value - b.value);
    sorted.slice(0, keepLowest).forEach((r) => keptIndices.add(r.index));
  } else {
    rawRolls.forEach((r) => keptIndices.add(r.index));
  }

  const rolls: DiceRollDetail[] = rawRolls.map((r) => ({
    die: r.index + 1,
    sides,
    value: r.value,
    kept: keptIndices.has(r.index),
  }));

  const keptSum = rolls.filter((r) => r.kept).reduce((sum, r) => sum + r.value, 0);
  const total = Math.max(0, keptSum + modifier);

  const primaryKeptRoll = rolls.find((r) => r.kept)?.value ?? 0;
  const isNat20 = sides === 20 && primaryKeptRoll === 20;
  const isNat1 = sides === 20 && primaryKeptRoll === 1;
  const isCritical = isNat20;

  const rollParts = rolls.map((r) => (r.kept ? `${r.value}` : `(${r.value})`)).join(", ");
  const modStr = modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : "";
  const explanation = `[${rollParts}]${modStr} = ${total}`;

  return {
    notation,
    label,
    rolls,
    modifier,
    total,
    isNat20,
    isNat1,
    isCritical,
    explanation,
  };
}

export function rollAdvantage(modifier: number = 0, label?: string): RollResult {
  return executeRoll(`2d20kh1${modifier >= 0 ? `+${modifier}` : modifier}`, label ?? "Roll with Advantage");
}

export function rollDisadvantage(modifier: number = 0, label?: string): RollResult {
  return executeRoll(`2d20kl1${modifier >= 0 ? `+${modifier}` : modifier}`, label ?? "Roll with Disadvantage");
}

export function rollStandard(modifier: number = 0, label?: string): RollResult {
  return executeRoll(`1d20${modifier >= 0 ? `+${modifier}` : modifier}`, label ?? "Standard Roll");
}
