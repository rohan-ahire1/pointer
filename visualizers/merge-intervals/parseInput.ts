import type { MergeInput } from "./types";
import { stripPasteSyntax } from "../kit/paste";

/**
 * Input rules (docs/patterns/15-intervals.md): 1–6 intervals like 1-3, with
 * 0 ≤ start ≤ end ≤ 20, separated by spaces or commas. Every error says
 * what *is* allowed.
 */
export function parseInput(input: string): MergeInput | { error: string } {
  // LeetCode pairs like [1,3] become 1-3 before the brackets go.
  const raw = stripPasteSyntax(input.replace(/\[\s*(\d+)\s*,\s*(\d+)\s*\]/g, " $1-$2 "));
  if (raw.trim() === "") {
    return { error: "Enter 1–6 intervals like 1-3, with 0 ≤ start ≤ end ≤ 20." };
  }
  const tokens = raw.split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length === 0) {
    return { error: "Enter 1–6 intervals like 1-3, with 0 ≤ start ≤ end ≤ 20." };
  }
  if (tokens.length > 6) {
    return { error: `Enter 1–6 intervals like 1-3. You entered ${tokens.length}.` };
  }
  const items: MergeInput = [];
  for (let id = 0; id < tokens.length; id++) {
    const token = tokens[id];
    const match = /^(-?\d+)-(-?\d+)$/.exec(token);
    if (match === null) {
      return { error: `“${token}” isn’t an interval. Use the form start-end, like 1-3.` };
    }
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (start > end) {
      return { error: `“${token}” starts after it ends. Use 0 ≤ start ≤ end ≤ 20.` };
    }
    if (start < 0 || end > 20) {
      return { error: `“${token}” is out of range. Use 0 ≤ start ≤ end ≤ 20.` };
    }
    items.push({ id, start, end });
  }
  return items;
}
