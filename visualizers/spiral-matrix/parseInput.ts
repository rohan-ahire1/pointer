import { stripPasteSyntax } from "../kit/paste";
import type { SpiralInput } from "./types";

const RULE = "1–5 rows of 1–5 numbers from 0 to 99, with | between rows";

export function parseInput(input: string): SpiralInput | { error: string } {
  // A LeetCode grid like [[1,2],[3,4]] gives one row per inner [...].
  const inner = /\[\s*\[/.test(input) ? input.match(/\[[^[\]]*\]/g) : null;
  const rows = (inner ?? input.split("|")).map((row) =>
    stripPasteSyntax(row).split(/[\s,]+/).filter((token) => token !== ""),
  );
  if (rows.every((row) => row.length === 0)) return { error: `Enter ${RULE}.` };
  if (rows.length > 5) return { error: `Enter ${RULE}. You entered ${rows.length} rows.` };
  const width = rows[0].length;
  if (width === 0 || width > 5) return { error: `Enter ${RULE}. Row 1 has ${width} numbers.` };
  const grid: number[][] = [];
  for (const [index, row] of rows.entries()) {
    if (row.length !== width) {
      return { error: `Rows must all be the same length, but row ${index + 1} has ${row.length} and row 1 has ${width}.` };
    }
    for (const token of row) {
      if (!/^\d+$/.test(token) || Number(token) > 99) return { error: `“${token}” won’t fit. Use numbers from 0 to 99.` };
    }
    grid.push(row.map(Number));
  }
  return grid;
}
