import type { IslandsInput } from "./types";

/**
 * Input rules (docs/patterns/11-graphs.md): 1–5 rows of 1s (land) and 0s
 * (water), up to 6 wide, rows separated by spaces. All rows must be the
 * same length. Every error says what *is* allowed.
 */
export function parseInput(raw: string): IslandsInput | { error: string } {
  if (raw.trim() === "") {
    return { error: "Enter 1–5 rows of 1s and 0s, up to 6 wide, rows separated by spaces." };
  }
  const rows = raw.split(/\s+/).filter((token) => token !== "");
  if (rows.length > 5) {
    return { error: `Enter 1–5 rows of 1s and 0s. You entered ${rows.length}.` };
  }
  for (const row of rows) {
    if (!/^[01]+$/.test(row)) {
      return { error: `“${row}” isn’t 1s and 0s. Use only 1 (land) and 0 (water).` };
    }
    if (row.length > 6) {
      return { error: `“${row}” is ${row.length} wide. Keep rows up to 6 wide.` };
    }
  }
  const width = rows[0].length;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length !== width) {
      return {
        error: `Rows must all be the same length, but row ${i + 1} has ${rows[i].length} and row 1 has ${width}.`,
      };
    }
  }
  return rows.map((row) => row.split("").map((ch) => ch === "1"));
}
