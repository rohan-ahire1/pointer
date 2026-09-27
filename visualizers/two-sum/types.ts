/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input: numbers and the target. */
export type TwoSumInput = { nums: number[]; target: number };

export type TwoSumState = {
  nums: number[];
  target: number;
  /** Index being read; -1 on the setup step. */
  i: number;
  /** target - nums[i] for the current i; null on setup. */
  need: number | null;
  /** Map contents in insertion order. Re-setting an existing value updates its index in place (JS Map semantics). */
  map: { value: number; index: number }[];
  /** Result of this step's lookup of `need`. */
  lookup: "none" | "hit" | "miss";
  /** [earlier index, i] once found. */
  answer: [number, number] | null;
  phase: "setup" | "read" | "hit" | "miss" | "done";
};
