import type { Step } from "../types";
import type { SearchRotatedInput, SearchRotatedState } from "./types";

/**
 * Binary search with one extra question: one half around `mid` is always in
 * order, so check whether the target sits inside that half's range.
 */
export function trace({ nums, target }: SearchRotatedInput): Step<SearchRotatedState>[] {
  const steps: Step<SearchRotatedState>[] = [];
  let lo = 0;
  let hi = nums.length - 1;
  const push = (
    mid: number | null,
    sorted: SearchRotatedState["sorted"],
    answer: number | null,
    phase: SearchRotatedState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { nums, target, lo, hi, mid, sorted, answer, phase }, lines, note, sr });
  };

  push(null, null, null, "setup", [1], `Find ${target}. The list is rotated, but one half is always in order.`, `Searching for ${target} in ${nums.length} numbers.`);

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    push(mid, null, null, "mid", [2, 3], `Middle of ${lo}…${hi} is index ${mid}, value ${nums[mid]}.`, `lo ${lo}, hi ${hi}, mid ${mid}, value ${nums[mid]}.`);
    if (nums[mid] === target) {
      push(mid, null, mid, "done", [4], `Done. ${target} is at index ${mid}.`, `Done. Found ${target} at index ${mid}.`);
      return steps;
    }
    if (nums[lo] <= nums[mid]) {
      push(mid, "left", null, "side", [5], `${nums[lo]} ≤ ${nums[mid]}, so the left half is in order.`, "The left half is in order.");
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1;
        push(mid, "left", null, "narrow", [6], `${target} fits between ${nums[lo]} and ${nums[mid]}. Keep the left half.`, `Keep the left half. hi is now ${hi}.`);
      } else {
        lo = mid + 1;
        push(mid, "left", null, "narrow", [7], `${target} can’t be in that range. Drop the left half.`, `Drop the left half. lo is now ${lo}.`);
      }
    } else {
      push(mid, "right", null, "side", [8], `${nums[lo]} > ${nums[mid]}, so the right half is in order.`, "The right half is in order.");
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1;
        push(mid, "right", null, "narrow", [9], `${target} fits between ${nums[mid]} and ${nums[hi]}. Keep the right half.`, `Keep the right half. lo is now ${lo}.`);
      } else {
        hi = mid - 1;
        push(mid, "right", null, "narrow", [10], `${target} can’t be in that range. Drop the right half.`, `Drop the right half. hi is now ${hi}.`);
      }
    }
  }

  push(null, null, -1, "done", [13], `Done. Nothing left to search, so ${target} isn’t here.`, `Done. ${target} is not in the list.`);
  return steps;
}
