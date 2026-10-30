import { splitOnBar } from "../kit/parseNumbers";
import { MAX_STEPS, trace } from "./trace";
import type { WordSearchInput } from "./types";

export function parseInput(input: string): WordSearchInput | { error: string } {
  const parts = splitOnBar(input, "ABCE SFCS ADEE | SEE");
  if ("error" in parts) return parts;
  const rows = parts[0].trim().split(/[\s,]+/).filter((row) => row !== "");
  const word = parts[1].trim();
  if (rows.length < 1 || rows.length > 4) return { error: `Enter 1–4 rows before the |. You entered ${rows.length}.` };
  if (rows.some((row) => !/^[a-zA-Z]{1,5}$/.test(row))) return { error: "Each row needs 1–5 letters and nothing else." };
  if (new Set(rows.map((row) => row.length)).size !== 1) return { error: "Every row needs the same number of letters." };
  if (!/^[a-zA-Z]{1,6}$/.test(word)) return { error: "After the |, enter a word of 1–6 letters." };
  const parsed = { board: rows.map((row) => row.split("")), word };
  if (trace(parsed).length > MAX_STEPS) {
    return { error: "That takes too many steps to show. Use a shorter word or more varied letters." };
  }
  return parsed;
}
