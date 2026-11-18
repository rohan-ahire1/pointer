import { list } from "../kit/format";
import type { Step } from "../types";
import type { SubarraySumInput, SubarraySumState } from "./types";

const times = (n: number) => (n === 1 ? "once" : n === 2 ? "twice" : `${n} times`);

/**
 * One pass with a running total. A subarray i..j sums to k exactly when the
 * prefix before i equals prefix(j) - k, so count those earlier prefixes.
 */
export function trace({ nums, k }: SubarraySumInput): Step<SubarraySumState>[] {
  const steps: Step<SubarraySumState>[] = [];
  const seen = new Map<number, number>([[0, 1]]);
  const prefixes: number[] = [];
  let prefix = 0;
  let count = 0;
  const push = (
    i: number,
    need: number | null,
    hits: number | null,
    found: [number, number][],
    phase: SubarraySumState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({
      state: {
        nums, k, i, prefix, need, hits, count, found, phase,
        seen: [...seen].map(([sum, n]) => ({ sum, times: n })),
        prefixes: [...prefixes],
      },
      lines,
      note,
      sr,
    });
  };

  push(-1, null, null, [], "setup", [1, 2], `Count subarrays that add up to ${k}. The map starts with 0 once, for the empty prefix.`, `Counting subarrays of ${list(nums)} that sum to ${k}.`);

  nums.forEach((x, i) => {
    prefix += x;
    prefixes.push(prefix);
    const need = prefix - k;
    const hits = seen.get(need) ?? 0;
    count += hits;
    // Every earlier cut whose prefix is `need` starts a subarray that ends here.
    const found: [number, number][] = [];
    for (let j = -1; j < i; j++) if ((j < 0 ? 0 : prefixes[j]) === need) found.push([j + 1, i]);
    push(
      i, need, hits, found, "look", [3, 4, 5, 6],
      hits
        ? `Add ${x}: the prefix is ${prefix}. ${prefix} − ${k} = ${need} was seen ${times(hits)}, so count is ${count}.`
        : `Add ${x}: the prefix is ${prefix}. ${prefix} − ${k} = ${need} isn’t in the map yet.`,
      hits
        ? `Prefix ${prefix}. Found ${hits} subarray${hits === 1 ? "" : "s"} ending at index ${i}. Count ${count}.`
        : `Prefix ${prefix}. No subarray ending at index ${i}. Count ${count}.`,
    );
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
    push(i, need, hits, [], "store", [7], `Store prefix ${prefix}. The map has now seen it ${times(seen.get(prefix)!)}.`, `Stored prefix ${prefix}.`);
  });

  push(-1, null, null, [], "done", [9], `Done. ${count} subarray${count === 1 ? "" : "s"} add up to ${k}.`, `Done. The answer is ${count}.`);
  return steps;
}
