import { parseNumbers } from "../kit/parseNumbers";
import type { RainInput } from "./types";

export function parseInput(input: string): RainInput | { error: string } {
  return parseNumbers(input, { min: 0, max: 9, minCount: 2, maxCount: 12 });
}
