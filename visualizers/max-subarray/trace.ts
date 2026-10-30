import type { Step } from "../types";
import type { MaxSubarrayInput, MaxSubarrayState } from "./types";

/** Kadane's algorithm: a run that has gone negative only drags the next number down, so drop it. */
export function trace(nums: MaxSubarrayInput): Step<MaxSubarrayState>[] {
  const steps: Step<MaxSubarrayState>[] = [];
  let sum = 0;
  let start = 0;
  let best: number | null = null;
  let bestRange: MaxSubarrayState["bestRange"] = null;
  const push = (i: number, phase: MaxSubarrayState["phase"], lines: number[], note: string, sr: string) => {
    steps.push({ state: { nums, i, start, sum, best, bestRange, phase }, lines, note, sr });
  };

  push(-1, "setup", [1, 2], "Walk once, keeping a running sum and the best sum seen.", `${nums.length} numbers.`);

  nums.forEach((n, i) => {
    if (sum < 0) {
      const dropped = sum;
      sum = 0;
      start = i;
      push(i, "drop", [3, 4], `The run is at ${dropped}, which can only hurt. Start fresh here.`, `Sum was negative. New run starts at index ${i}.`);
    }
    sum += n;
    const beat = best === null || sum > best;
    if (beat) {
      best = sum;
      bestRange = { start, end: i };
    }
    push(i, beat ? "best" : "add", [5, 6], beat ? `Add ${n}: the run is ${sum}, a new best.` : `Add ${n}: the run is ${sum}. Best stays ${best}.`, `Index ${i}. Sum ${sum}. Best ${best}.`);
  });

  push(nums.length, "done", [8], `Done. The best run adds up to ${best}.`, `Done. The answer is ${best}.`);
  return steps;
}
