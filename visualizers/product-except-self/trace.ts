import { list } from "../kit/format";
import type { Step } from "../types";
import type { ProductInput, ProductState } from "./types";

/** -0 reads badly in a cell, and a zero times a negative produces it. */
const tidy = (n: number) => (n === 0 ? 0 : n);

/**
 * Two sweeps: `left` holds the product of everything before i, `right` the
 * product of everything after it, and each cell ends up as the two multiplied.
 */
export function trace(nums: ProductInput): Step<ProductState>[] {
  const out_: number[] = nums.map(() => 1);
  const steps: Step<ProductState>[] = [];
  let left = 1;
  let right = 1;
  const push = (i: number, phase: ProductState["phase"], lines: number[], note: string, sr: string) => {
    steps.push({ state: { nums: [...nums], out: [...out_], i, left, right, phase }, lines, note, sr });
  };

  push(-1, "setup", [1, 2], "No division allowed. Sweep once from each side instead.", `${nums.length} numbers. Output starts as all 1s.`);
  for (let i = 0; i < nums.length; i++) {
    out_[i] = left;
    push(i, "left", [3, 4], `Everything left of index ${i} multiplies to ${left}. Store it.`, `Left pass, index ${i}. Left product ${left}. Output ${list(out_)}.`);
    left = tidy(left * nums[i]);
    push(i, "left", [5], `Add ${nums[i]} to the running product: left is now ${left}.`, `Left pass, index ${i}. Left product becomes ${left}.`);
  }
  for (let i = nums.length - 1; i >= 0; i--) {
    out_[i] = tidy(out_[i] * right);
    push(i, "right", [8, 9], `Everything right of index ${i} multiplies to ${right}. Multiply it in.`, `Right pass, index ${i}. Right product ${right}. Output ${list(out_)}.`);
    right = tidy(right * nums[i]);
    push(i, "right", [10], `Add ${nums[i]} to the running product: right is now ${right}.`, `Right pass, index ${i}. Right product becomes ${right}.`);
  }
  push(-1, "done", [12], `Done. Each cell is everything to its left times everything to its right.`, `Done. The answer is ${list(out_)}.`);
  return steps;
}
