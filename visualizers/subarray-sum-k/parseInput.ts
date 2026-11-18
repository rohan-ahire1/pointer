import { parseNumbers, splitOnBar } from "../kit/parseNumbers";
import type { SubarraySumInput } from "./types";

const EXAMPLE = "3 4 7 2 -3 1 4 2 | 7";

export function parseInput(input: string): SubarraySumInput | { error: string } {
  const parts = splitOnBar(input, EXAMPLE);
  if ("error" in parts) return parts;
  const nums = parseNumbers(parts[0], { min: -9, max: 9, minCount: 1, maxCount: 10 });
  if ("error" in nums) return nums;
  const k = parseNumbers(parts[1], { min: -30, max: 30, minCount: 1, maxCount: 1 });
  if ("error" in k) return { error: "After the |, enter one k from -30 to 30." };
  return { nums, k: k[0] };
}
