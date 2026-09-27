/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input: amount per house. */
export type RobberInput = number[];

export type RobberState = {
  nums: number[];
  /** Length nums.length + 1; null = not filled yet. dp[i] = best from the first i houses. */
  dp: (number | null)[];
  /** dp index being decided. */
  i: number | null;
  skip: number | null;
  take: number | null;
  choice: "skip" | "take" | null;
  phase: "setup" | "base" | "compare" | "decide" | "done";
  /** 0-based houses robbed in the best plan; set on done. */
  robbed: number[] | null;
};
