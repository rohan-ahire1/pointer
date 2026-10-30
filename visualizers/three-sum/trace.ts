import { list } from "../kit/format";
import type { Step } from "../types";
import type { ThreeSumInput, ThreeSumState } from "./types";

const plus = (n: number) => (n < 0 ? `− ${-n}` : `+ ${n}`);

/** Sort, fix one number, then run two pointers over the rest for the other two. */
export function trace(input: ThreeSumInput): Step<ThreeSumState>[] {
  const nums = [...input].sort((a, b) => a - b);
  const steps: Step<ThreeSumState>[] = [];
  const found: number[][] = [];
  const push = (
    i: number,
    l: number,
    r: number,
    sum: number | null,
    phase: ThreeSumState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { nums, i, l, r, sum, found: found.map((t) => [...t]), phase }, lines, note, sr });
  };

  push(-1, -1, -1, null, "setup", [1, 2], `Sort first: ${list(nums)}. Now both ends can close in.`, `Sorted the numbers: ${list(nums)}.`);

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      push(i, -1, -1, null, "skip", [4], `${nums[i]} was already fixed. Skip it, or the answers would repeat.`, `Index ${i} repeats ${nums[i]}. Skipped.`);
      continue;
    }
    let l = i + 1;
    let r = nums.length - 1;
    push(i, l, r, null, "fix", [3, 5], `Fix ${nums[i]}. Find two more that sum to ${-nums[i]}.`, `Fixed index ${i}, value ${nums[i]}. l at ${l}, r at ${r}.`);
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      const sumText = `${nums[i]} ${plus(nums[l])} ${plus(nums[r])} = ${sum}`;
      push(i, l, r, sum, "sum", [6, 7], `${sumText}.`, `l at ${l}, r at ${r}. Sum is ${sum}.`);
      if (sum < 0) {
        l++;
        push(i, l, r, sum, "move", [8], `${sum} is too small. Move l right for something bigger.`, `Sum too small. l moves to ${l}.`);
      } else if (sum > 0) {
        r--;
        push(i, l, r, sum, "move", [9], `${sum} is too big. Move r left for something smaller.`, `Sum too big. r moves to ${r}.`);
      } else {
        const trio = [nums[i], nums[l], nums[r]];
        found.push(trio);
        push(i, l, r, sum, "hit", [10, 11], `Zero. Keep ${list(trio)}.`, `Found the trio ${list(trio)}.`);
        l++;
        r--;
        while (l < r && nums[l] === nums[l - 1]) l++;
        push(i, l, r, sum, "move", [12, 13], "Move both in, stepping past repeats of the same value.", `l at ${l}, r at ${r}.`);
      }
    }
  }

  const count = found.length;
  push(
    -1,
    -1,
    -1,
    null,
    "done",
    [17],
    `Done. ${count === 0 ? "No trio adds up to zero." : `${count} unique ${count === 1 ? "trio adds" : "trios add"} up to zero.`}`,
    `Done. Found ${count} ${count === 1 ? "trio" : "trios"}.`,
  );
  return steps;
}
