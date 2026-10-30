import { parseNumbers } from "../kit/parseNumbers";
import type { ProductInput } from "./types";

export function parseInput(input: string): ProductInput | { error: string } {
  return parseNumbers(input, { min: -9, max: 9, minCount: 2, maxCount: 7 });
}
