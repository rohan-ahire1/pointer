import { parseNumbers } from "../kit/parseNumbers";
import type { BitsInput } from "./types";

export function parseInput(input: string): BitsInput | { error: string } {
  const nums = parseNumbers(input, { min: 0, max: 255, minCount: 1, maxCount: 1 });
  if ("error" in nums) return nums;
  return { n: nums[0] };
}
