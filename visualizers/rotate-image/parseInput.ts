import { stripPasteSyntax } from "../kit/paste";
import type { RotateInput } from "./types";

const RULE = "a square grid, 2×2 up to 5×5, of numbers from 0 to 99, with | between rows (or LeetCode’s [[1,2],[3,4]])";

export function parseInput(input: string): RotateInput | { error: string } {
  // A LeetCode grid like [[1,2],[3,4]] gives one row per inner [...].
  const inner = /\[\s*\[/.test(input) ? input.match(/\[[^[\]]*\]/g) : null;
  const rows = (inner ?? input.split("|")).map((row) =>
    stripPasteSyntax(row).split(/[\s,]+/).filter((token) => token !== ""),
  );
  if (rows.every((row) => row.length === 0)) return { error: `Enter ${RULE}.` };
  const width = rows[0].length;
  for (const [index, row] of rows.entries()) {
    if (row.length !== width) {
      return { error: `Rows must all be the same length, but row ${index + 1} has ${row.length} and row 1 has ${width}.` };
    }
    for (const token of row) {
      if (!/^\d+$/.test(token) || Number(token) > 99) return { error: `“${token}” won’t fit. Use whole numbers from 0 to 99.` };
    }
  }
  if (rows.length !== width) {
    return { error: `The grid must be square, but it has ${rows.length} rows of ${width} numbers.` };
  }
  if (width < 2 || width > 5) return { error: `Enter ${RULE}. You entered ${width}×${width}.` };
  return rows.map((row) => row.map(Number));
}
