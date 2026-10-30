import { parseNumbers } from "../kit/parseNumbers";
import type { MaxSubarrayInput } from "./types";

export function parseInput(input: string): MaxSubarrayInput | { error: string } {
  return parseNumbers(input, { min: -99, max: 99, minCount: 1, maxCount: 10 });
}
