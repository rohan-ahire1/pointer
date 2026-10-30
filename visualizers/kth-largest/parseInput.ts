import { parseNumbers, splitOnBar } from "../kit/parseNumbers";
import type { KthLargestInput } from "./types";

export function parseInput(input: string): KthLargestInput | { error: string } {
  const parts = splitOnBar(input, "3 2 1 5 6 4 | 2");
  if ("error" in parts) return parts;
  const nums = parseNumbers(parts[0], { min: -99, max: 99, minCount: 1, maxCount: 8 });
  if ("error" in nums) return nums;
  const k = parseNumbers(parts[1], { min: 1, max: nums.length, minCount: 1, maxCount: 1 });
  if ("error" in k) return { error: `After the |, enter one k from 1 to ${nums.length}.` };
  return { nums, k: k[0] };
}
