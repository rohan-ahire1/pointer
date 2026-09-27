import type { TwoSumInput } from "./types";

/**
 * Input rules (docs/patterns/01-arrays-and-hashing.md): 2–8 whole numbers
 * from -99 to 99 separated by spaces or commas, a `|`, then one target from
 * -198 to 198. Every error says what *is* allowed.
 */
export function parseInput(raw: string): TwoSumInput | { error: string } {
  if (raw.trim() === "") {
    return { error: "Enter 2–8 whole numbers from -99 to 99, then | and the target." };
  }
  const parts = raw.split("|");
  if (parts.length !== 2) {
    return { error: "Add one | between the numbers and the target, like 2 7 11 15 | 9." };
  }
  const splitTokens = (side: string): string[] =>
    side.split(/[\s,]+/).filter((token) => token !== "");

  const numTokens = splitTokens(parts[0]);
  if (numTokens.length === 0) {
    return { error: "Enter 2–8 whole numbers from -99 to 99 before the |." };
  }
  if (numTokens.length < 2 || numTokens.length > 8) {
    return { error: `Enter 2–8 numbers before the |. You entered ${numTokens.length}.` };
  }
  const nums: number[] = [];
  for (const token of numTokens) {
    if (!/^-?\d+$/.test(token)) {
      return { error: `“${token}” isn’t a whole number. Use numbers from -99 to 99.` };
    }
    const n = Number(token);
    if (n < -99 || n > 99) {
      return { error: `${n} is out of range. Use whole numbers from -99 to 99.` };
    }
    nums.push(n);
  }

  const targetTokens = splitTokens(parts[1]);
  if (targetTokens.length !== 1 || !/^-?\d+$/.test(targetTokens[0])) {
    return { error: "The target after the | must be one whole number from -198 to 198." };
  }
  const target = Number(targetTokens[0]);
  if (target < -198 || target > 198) {
    return { error: `${target} is out of range. The target must be from -198 to 198.` };
  }
  return { nums, target };
}
