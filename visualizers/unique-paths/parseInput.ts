import { parseNumbers } from "../kit/parseNumbers";
import type { UniquePathsInput } from "./types";

const RULE = "Enter rows from 1 to 5, then columns from 1 to 7, like 3 7.";

export function parseInput(input: string): UniquePathsInput | { error: string } {
  const nums = parseNumbers(input, { min: 1, max: 7, minCount: 2, maxCount: 2 });
  if ("error" in nums) return { error: RULE };
  const [m, n] = nums;
  if (m > 5) return { error: RULE };
  return { m, n };
}
