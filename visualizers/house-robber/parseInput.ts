import type { RobberInput } from "./types";

/**
 * Input rules (docs/patterns/12-1-d-dp.md): 1–8 amounts from 0 to 99, one
 * per house, separated by spaces or commas. Every error says what *is*
 * allowed.
 */
export function parseInput(raw: string): RobberInput | { error: string } {
  if (raw.trim() === "") {
    return { error: "Enter 1–8 amounts from 0 to 99, one per house, separated by spaces." };
  }
  const tokens = raw.split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length === 0) {
    return { error: "Enter 1–8 amounts from 0 to 99, one per house, separated by spaces." };
  }
  if (tokens.length > 8) {
    return { error: `Enter 1–8 amounts from 0 to 99. You entered ${tokens.length}.` };
  }
  const nums: number[] = [];
  for (const token of tokens) {
    if (!/^-?\d+$/.test(token)) {
      return { error: `“${token}” isn’t a whole number. Use amounts from 0 to 99.` };
    }
    const n = Number(token);
    if (n < 0 || n > 99) {
      return { error: `${n} is out of range. Use amounts from 0 to 99.` };
    }
    nums.push(n);
  }
  return nums;
}
