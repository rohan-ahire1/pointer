import type { Step } from "../types";
import type { BitsInput, BitsState } from "./types";

export const WIDTH = 8;

/** The number as `WIDTH` bits, leftmost first. */
export function bitsOf(n: number): number[] {
  return Array.from({ length: WIDTH }, (_, index) => (n >> (WIDTH - 1 - index)) & 1);
}

/** n & (n - 1) clears the lowest 1 bit, so the loop runs once per 1 bit and skips the 0s. */
export function trace({ n: start }: BitsInput): Step<BitsState>[] {
  let n = start;
  let count = 0;
  const steps: Step<BitsState>[] = [];
  const push = (
    below: number | null,
    result: number | null,
    lowest: number | null,
    phase: BitsState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { n, below, result, lowest, count, phase }, lines, note, sr });
  };

  push(null, null, null, "setup", [1], `${start} in binary is ${bitsOf(start).join("")}. Count starts at 0.`, `${start} is ${bitsOf(start).join(" ")} in binary.`);

  while (n !== 0) {
    const below = n - 1;
    const lowest = Math.log2(n & -n);
    push(below, null, lowest, "minus", [2, 3], `n − 1 is ${below}. The lowest 1 turns off and the 0s after it turn on.`, `n minus 1 is ${bitsOf(below).join(" ")}.`);
    const result = n & below;
    push(below, result, lowest, "and", [3], "AND keeps a bit only when both rows have it. The lowest 1 is gone.", `n and n minus 1 is ${bitsOf(result).join(" ")}.`);
    n = result;
    count++;
    push(null, null, null, "count", [4], `That’s ${count} cleared. n is now ${n}.`, `Count ${count}. n is ${n}.`);
  }

  push(null, null, null, "done", [6], `Done. ${start} has ${count} ${count === 1 ? "one bit" : "one bits"}.`, `Done. ${count} one bits.`);
  return steps;
}
