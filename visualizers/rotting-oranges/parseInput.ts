import type { OrangesInput } from "./types";
import { stripPasteSyntax } from "../kit/paste";

/**
 * 1–5 rows of 0 (empty), 1 (fresh) and 2 (rotten), up to 6 wide, rows separated
 * by spaces. A LeetCode grid like [[2,1,1],[1,1,0]] works too.
 */
export function parseInput(input: string): OrangesInput | { error: string } {
  const inner = /\[\s*\[/.test(input) ? input.match(/\[[^[\]]*\]/g) : null;
  const raw = inner ? inner.map((row) => row.replace(/[^0-9]/g, "")).join(" ") : stripPasteSyntax(input);
  const rows = raw.split(/[\s,]+/).filter((token) => token !== "");
  if (rows.length === 0) {
    return { error: "Enter 1–5 rows of 0, 1 and 2, up to 6 wide, rows separated by spaces." };
  }
  if (rows.length > 5) {
    return { error: `Enter 1–5 rows. You entered ${rows.length}.` };
  }
  for (const row of rows) {
    if (!/^[012]+$/.test(row)) {
      return { error: `“${row}” has other characters. Use 0 (empty), 1 (fresh) and 2 (rotten).` };
    }
    if (row.length > 6) {
      return { error: `“${row}” is ${row.length} wide. Keep rows up to 6 wide.` };
    }
  }
  const width = rows[0].length;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length !== width) {
      return { error: `Rows must all be the same length, but row ${i + 1} has ${rows[i].length} and row 1 has ${width}.` };
    }
  }
  return rows.map((row) => row.split("").map(Number));
}
