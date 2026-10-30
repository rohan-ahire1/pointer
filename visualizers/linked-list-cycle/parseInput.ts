import { parseNumbers, splitOnBar } from "../kit/parseNumbers";
import type { CycleInput } from "./types";

export function parseInput(input: string): CycleInput | { error: string } {
  const parts = splitOnBar(input, "3 2 0 -4 | 1");
  if ("error" in parts) return parts;
  const values = parseNumbers(parts[0], { min: -99, max: 99, minCount: 2, maxCount: 8 });
  if ("error" in values) return values;
  const lastAllowed = values.length - 2;
  const pos = parseNumbers(parts[1], { min: -1, max: lastAllowed, minCount: 1, maxCount: 1 });
  if ("error" in pos) return { error: `After the |, enter one index from -1 to ${lastAllowed}. -1 means no cycle.` };
  return { values, pos: pos[0] };
}
