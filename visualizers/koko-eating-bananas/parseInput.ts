import { parseNumbers, splitOnBar } from "../kit/parseNumbers";
import type { KokoInput } from "./types";

const EXAMPLE = "3 6 7 11 | 8";

export function parseInput(input: string): KokoInput | { error: string } {
  const parts = splitOnBar(input, EXAMPLE);
  if ("error" in parts) return parts;
  const piles = parseNumbers(parts[0], { min: 1, max: 30, minCount: 1, maxCount: 6 });
  if ("error" in piles) return piles;
  const h = parseNumbers(parts[1], { min: 1, max: 99, minCount: 1, maxCount: 1 });
  if ("error" in h) return { error: "After the |, enter the hours as one number from 1 to 99." };
  if (h[0] < piles.length) {
    return { error: `Koko needs at least one hour per pile, so h must be ${piles.length} or more.` };
  }
  return { piles, h: h[0] };
}
