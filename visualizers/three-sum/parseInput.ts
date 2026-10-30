import { parseNumbers } from "../kit/parseNumbers";
import type { ThreeSumInput } from "./types";

export function parseInput(input: string): ThreeSumInput | { error: string } {
  return parseNumbers(input, { min: -99, max: 99, minCount: 3, maxCount: 8 });
}
