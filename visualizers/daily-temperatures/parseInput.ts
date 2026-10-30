import { parseNumbers } from "../kit/parseNumbers";
import type { TemperaturesInput } from "./types";

export function parseInput(input: string): TemperaturesInput | { error: string } {
  return parseNumbers(input, { min: 30, max: 100, minCount: 2, maxCount: 8 });
}
