/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input: jump lengths. */
export type JumpInput = number[];

export type JumpState = {
  nums: number[];
  i: number | null;
  reach: number;
  /** Reach before this step (to show whether the arc extended it). */
  prevReach: number;
  phase: "setup" | "extend" | "noGain" | "stuck" | "done";
  stuckAt: number | null;
  verdict: boolean | null;
};
