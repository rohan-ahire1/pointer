/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input: a rotated ascending array of distinct numbers. */
export type FindMinInput = number[];

export type FindMinState = {
  nums: number[];
  lo: number;
  hi: number;
  mid: number | null;
  phase: "setup" | "probe" | "right" | "left" | "done";
  /** Comparison of nums[mid] with nums[hi] on probe/decision steps. */
  compare: ">" | "<=" | null;
  /** Search-space size history: starts [nums.length], one entry appended per decision. */
  sizes: number[];
  answer: number | null;
};
