import type { Step } from "../types";
import type { TwoSumInput, TwoSumState } from "./types";

/**
 * Traced Two Sum (docs/patterns/01-arrays-and-hashing.md): walk the array
 * once, asking the map for each number's partner. Pure and deterministic —
 * the same input always yields the same steps. No pair is a valid outcome
 * here (answer stays null), even though LeetCode always has one.
 */
export function trace(input: TwoSumInput): Step<TwoSumState>[] {
  const { nums, target } = input;
  const out: Step<TwoSumState>[] = [];
  // Insertion-ordered map entries, mirroring JS Map semantics: re-setting a
  // value updates its index in place instead of appending a duplicate.
  const map: { value: number; index: number }[] = [];
  /** Negative numbers get brackets so the subtraction still reads well. */
  const shown = (n: number): string => (n < 0 ? `(${n})` : `${n}`);
  const push = (
    i: number,
    need: number | null,
    lookup: TwoSumState["lookup"],
    answer: [number, number] | null,
    phase: TwoSumState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        nums: [...nums],
        target,
        i,
        need,
        map: map.map((entry) => ({ ...entry })),
        lookup,
        answer: answer === null ? null : [answer[0], answer[1]],
        phase,
      },
      lines,
      note,
      sr,
    });
  };

  push(
    -1,
    null,
    "none",
    null,
    "setup",
    [1],
    "Start with an empty map. It will remember each number’s index.",
    `Starting out. ${nums.length} numbers to read, target ${target}. The map is empty.`,
  );
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    push(
      i,
      need,
      "none",
      null,
      "read",
      [2, 3],
      `i reaches ${nums[i]}. You need ${target} − ${shown(nums[i])} = ${need}.`,
      `i at ${i}, value ${nums[i]}. Need ${need}. Map has ${map.length} ${map.length === 1 ? "entry" : "entries"}. No pair yet.`,
    );
    const hit = map.find((entry) => entry.value === need);
    if (hit !== undefined) {
      const answer: [number, number] = [hit.index, i];
      push(
        i,
        need,
        "hit",
        answer,
        "hit",
        [4, 5],
        `${need} is in the map at index ${hit.index}. Found the pair.`,
        `i at ${i}, value ${nums[i]}. Need ${need}. Map holds ${need} at ${hit.index}. Pair found: ${hit.index} and ${i}.`,
      );
      push(
        i,
        need,
        "none",
        answer,
        "done",
        [5],
        `Done. nums[${hit.index}] + nums[${i}] = ${target}, so the answer is [${hit.index}, ${i}].`,
        `Done. nums[${hit.index}] plus nums[${i}] is ${target}. The answer is ${hit.index} and ${i}.`,
      );
      return out;
    }
    const existing = map.find((entry) => entry.value === nums[i]);
    if (existing !== undefined) {
      existing.index = i;
    } else {
      map.push({ value: nums[i], index: i });
    }
    push(
      i,
      need,
      "miss",
      null,
      "miss",
      [4, 7],
      `${need} isn’t in the map yet. Remember ${nums[i]} at index ${i}.`,
      `i at ${i}, value ${nums[i]}. Need ${need}. Not in the map. Remembering ${nums[i]} at ${i}.`,
    );
  }
  push(
    nums.length - 1,
    null,
    "none",
    null,
    "done",
    [9],
    `Done. No two numbers add up to ${target}.`,
    `Done. No pair adds to ${target}. Checked all ${nums.length} numbers.`,
  );
  return out;
}
