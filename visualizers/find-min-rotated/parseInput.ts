import type { FindMinInput } from "./types";

const ALLOWED = "1–10 different numbers from -99 to 99, sorted then rotated";

/**
 * Input rules (docs/patterns/05-binary-search.md): 1–10 different whole
 * numbers from -99 to 99 that form a rotation of an ascending list.
 * Duplicates and non-rotations are rejected with the hint as the error
 * copy, so every error says what *is* allowed.
 */
export function parseInput(raw: string): FindMinInput | { error: string } {
  if (raw.trim() === "") {
    return { error: `Enter ${ALLOWED}, like 4 5 6 1 2 3.` };
  }
  const tokens = raw.trim().split(/\s+/);
  if (tokens.length < 1 || tokens.length > 10) {
    return { error: `Enter ${ALLOWED}. You entered ${tokens.length} numbers.` };
  }
  const nums: number[] = [];
  for (const token of tokens) {
    if (!/^-?\d+$/.test(token)) {
      return { error: `“${token}” isn’t a whole number. Enter ${ALLOWED}.` };
    }
    const n = Number(token);
    if (n < -99 || n > 99) {
      return { error: `${n} is out of range. Enter ${ALLOWED}.` };
    }
    nums.push(n);
  }
  if (new Set(nums).size !== nums.length) {
    return { error: `Numbers must be different. Enter ${ALLOWED}.` };
  }
  // A distinct list is a rotated ascending list exactly when it drops at
  // most once (counting the wraparound from the last back to the first).
  let drops = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > nums[(i + 1) % nums.length]) drops++;
  }
  if (drops > 1) {
    return { error: `That isn’t a rotation of a sorted list. Enter ${ALLOWED}.` };
  }
  return nums;
}
