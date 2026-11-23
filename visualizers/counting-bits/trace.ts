import type { Step } from "../types";
import type { CountingBitsInput, CountingBitsState } from "./types";

/** 16 is the biggest n, and it takes 5 bits. */
export const WIDTH = 5;

/** The number as `WIDTH` bits, leftmost first. */
export function bitsOf(n: number): number[] {
  return Array.from({ length: WIDTH }, (_, index) => (n >> (WIDTH - 1 - index)) & 1);
}

/** Each answer is the answer for i with its last bit dropped, plus that last bit. */
export function trace({ n }: CountingBitsInput): Step<CountingBitsState>[] {
  const ans: (number | null)[] = Array.from({ length: n + 1 }, (_, index) => (index === 0 ? 0 : null));
  const steps: Step<CountingBitsState>[] = [];
  const push = (
    i: number | null,
    phase: CountingBitsState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    const half = i === null ? null : i >> 1;
    const last = i === null ? null : i & 1;
    steps.push({ state: { n, ans: [...ans], i, half, last, phase }, lines, note, sr });
  };

  push(null, "setup", [1], `ans has ${n + 1} slots. ans[0] is 0, because 0 has no 1 bits.`, `Array of ${n + 1} slots. ans 0 is 0.`);

  for (let i = 1; i <= n; i++) {
    const half = i >> 1;
    const last = i & 1;
    const reused = ans[half] as number;
    push(
      i,
      "look",
      [2, 3],
      `i = ${i} is ${bitsOf(i).join("")}. Drop the last bit to get ${half}, and reuse ans[${half}] = ${reused}.`,
      `i is ${i}, binary ${bitsOf(i).join(" ")}. Dropping the last bit gives ${half}, whose answer is ${reused}. The last bit is ${last}.`,
    );
    ans[i] = reused + last;
    push(
      i,
      "fill",
      [3],
      `ans[${i}] = ans[${half}] + (${i} & 1) = ${reused} + ${last} = ${ans[i]}.`,
      `ans ${i} is ${reused} plus ${last}, which is ${ans[i]}.`,
    );
  }

  push(null, "done", [5], `Done. ans = [${ans.join(",")}].`, `Done. ans is ${ans.join(", ")}.`);
  return steps;
}
