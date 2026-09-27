import type { Step } from "../types";
import type { FindMinInput, FindMinState } from "./types";

/**
 * Traced Find Minimum in Rotated Sorted Array
 * (docs/patterns/05-binary-search.md): compare the middle with the right
 * end; that one comparison says which half holds the drop. Pure and
 * deterministic — the same numbers always yield the same steps.
 */
export function trace(input: FindMinInput): Step<FindMinState>[] {
  const nums = [...input];
  const out: Step<FindMinState>[] = [];
  let lo = 0;
  let hi = nums.length - 1;
  // Search-space size history: starts with the full length, one entry per
  // decision (the view draws this as the halving trail).
  const sizes: number[] = [nums.length];
  const push = (
    mid: number | null,
    phase: FindMinState["phase"],
    compare: FindMinState["compare"],
    answer: number | null,
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        nums: [...nums],
        lo,
        hi,
        mid,
        phase,
        compare,
        sizes: [...sizes],
        answer,
      },
      lines,
      note,
      sr,
    });
  };

  push(
    null,
    "setup",
    null,
    null,
    [1],
    nums.length === 1
      ? "Only one number, so it must be the minimum. lo and hi both at 0."
      : `The minimum is somewhere in all ${nums.length} numbers. lo at 0, hi at ${hi}.`,
    `Starting out. Search space index 0 to ${hi}, all ${nums.length} ${nums.length === 1 ? "number" : "numbers"}. The minimum is somewhere inside.`,
  );
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const compare: FindMinState["compare"] = nums[mid] > nums[hi] ? ">" : "<=";
    push(
      mid,
      "probe",
      compare,
      null,
      [2, 3, 4],
      `mid is index ${mid}, value ${nums[mid]}. Compare it with the right end, ${nums[hi]}.`,
      `Search space index ${lo} to ${hi}, ${hi - lo + 1} numbers. mid at ${mid}, value ${nums[mid]}, compared with ${nums[hi]} at hi.`,
    );
    const midValue = nums[mid];
    const hiValue = nums[hi];
    if (compare === ">") {
      const ruledOut = lo === mid ? `index ${lo}` : `index ${lo} to ${mid}`;
      lo = mid + 1;
      sizes.push(hi - lo + 1);
      push(
        mid,
        "right",
        compare,
        null,
        [5],
        `${midValue} > ${hiValue}, so the drop is right of mid. Rule out ${ruledOut}.`,
        `${midValue} is greater than ${hiValue}. Search space index ${lo} to ${hi}, ${hi - lo + 1} numbers.`,
      );
    } else {
      hi = mid;
      sizes.push(hi - lo + 1);
      push(
        mid,
        "left",
        compare,
        null,
        [7],
        `${midValue} ≤ ${hiValue}, so the minimum is mid or left of it. Rule out everything after mid.`,
        `${midValue} is at most ${hiValue}. Search space index ${lo} to ${hi}, ${hi - lo + 1} numbers.`,
      );
    }
  }
  push(
    null,
    "done",
    null,
    nums[lo],
    [10],
    `Done. lo and hi meet at index ${lo}. The minimum is ${nums[lo]}.`,
    `Done. lo and hi meet at index ${lo}. The minimum is ${nums[lo]}.`,
  );
  return out;
}
