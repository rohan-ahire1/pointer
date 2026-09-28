import type { JumpInput } from "./types";

/**
 * Input rules (docs/patterns/14-greedy.md): 1–10 jump lengths from 0 to 5,
 * separated by spaces or commas. Every error says what *is* allowed.
 */
export function parseInput(raw: string): JumpInput | { error: string } {
  if (raw.trim() === "") {
    return { error: "Enter 1–10 jump lengths from 0 to 5, separated by spaces." };
  }
  const tokens = raw.split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length === 0) {
    return { error: "Enter 1–10 jump lengths from 0 to 5, separated by spaces." };
  }
  if (tokens.length > 10) {
    return { error: `Enter 1–10 jump lengths from 0 to 5. You entered ${tokens.length}.` };
  }
  const nums: number[] = [];
  for (const token of tokens) {
    if (!/^-?\d+$/.test(token)) {
      return { error: `“${token}” isn’t a whole number. Use jump lengths from 0 to 5.` };
    }
    const n = Number(token);
    if (n < 0 || n > 5) {
      return { error: `${n} is out of range. Use jump lengths from 0 to 5.` };
    }
    nums.push(n);
  }
  return nums;
}
