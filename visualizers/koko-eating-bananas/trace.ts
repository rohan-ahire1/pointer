import { list } from "../kit/format";
import type { Step } from "../types";
import type { KokoInput, KokoState } from "./types";

/**
 * Binary search on the answer: the speeds 1..max(piles) are sorted by
 * "fast enough or not", so halve them until one speed is left.
 */
export function trace({ piles, h }: KokoInput): Step<KokoState>[] {
  const steps: Step<KokoState>[] = [];
  let lo = 1;
  let hi = Math.max(...piles);
  const push = (
    k: number | null,
    each: number[] | null,
    answer: number | null,
    phase: KokoState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    const hours = each ? each.reduce((a, b) => a + b, 0) : null;
    steps.push({ state: { piles, h, lo, hi, k, each, hours, answer, phase }, lines, note, sr });
  };

  push(null, null, null, "setup", [1], `${h} hours to eat it all. The speed is somewhere from 1 to ${hi} bananas an hour.`, `Piles ${list(piles)}, ${h} hours. Speeds 1 to ${hi}.`);

  while (lo < hi) {
    const k = Math.floor((lo + hi) / 2);
    push(k, null, null, "guess", [2, 3], `Speeds ${lo}…${hi} are left. Try the middle one: ${k} an hour.`, `Trying speed ${k}. Range ${lo} to ${hi}.`);
    const each = piles.map((p) => Math.ceil(p / k));
    const hours = each.reduce((a, b) => a + b, 0);
    push(k, each, null, "count", [4, 5], `At ${k} an hour the piles take ${each.join(" + ")} = ${hours} hours.`, `Speed ${k} takes ${hours} hours. The limit is ${h}.`);
    if (hours <= h) {
      hi = k;
      push(k, each, null, "narrow", [6], `${hours} ≤ ${h}, fast enough. The answer is ${k} or slower: hi = ${k}.`, `Fast enough. Speeds ${lo} to ${hi} left.`);
    } else {
      lo = k + 1;
      push(k, each, null, "narrow", [7], `${hours} > ${h}, too slow. Every speed up to ${k} is out: lo = ${lo}.`, `Too slow. Speeds ${lo} to ${hi} left.`);
    }
  }

  push(null, null, lo, "done", [9], `Done. Only ${lo} is left, so ${lo} bananas an hour is the slowest speed that works.`, `Done. The answer is ${lo}.`);
  return steps;
}
