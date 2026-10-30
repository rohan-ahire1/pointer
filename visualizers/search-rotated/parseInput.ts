import { parseNumbers, splitOnBar } from "../kit/parseNumbers";
import type { SearchRotatedInput } from "./types";

const EXAMPLE = "4 5 6 7 0 1 2 | 0";

export function parseInput(input: string): SearchRotatedInput | { error: string } {
  const parts = splitOnBar(input, EXAMPLE);
  if ("error" in parts) return parts;
  const nums = parseNumbers(parts[0], { min: -99, max: 99, minCount: 1, maxCount: 10 });
  if ("error" in nums) return nums;
  const target = parseNumbers(parts[1], { min: -99, max: 99, minCount: 1, maxCount: 1 });
  if ("error" in target) return { error: "After the |, enter one target from -99 to 99." };
  if (new Set(nums).size !== nums.length) {
    return { error: `Numbers must be different. Try ${EXAMPLE}.` };
  }
  // A distinct list is a rotated sorted list exactly when it drops at most once,
  // counting the wrap from the last number back to the first.
  const drops = nums.filter((n, i) => n > nums[(i + 1) % nums.length]).length;
  if (drops > 1) return { error: `That isn’t a rotation of a sorted list. Try ${EXAMPLE}.` };
  return { nums, target: target[0] };
}
