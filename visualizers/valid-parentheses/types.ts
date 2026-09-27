/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input: the bracket string. */
export type ParensInput = string;

export type ParensState = {
  s: string;
  /** Index being read; -1 on setup. */
  i: number;
  /** Bottom first. `from` is the index in `s` the plate came from (use it as the React key). */
  stack: { ch: string; from: number }[];
  /** Indices of characters settled into matched pairs (both opener and closer). */
  matched: number[];
  phase: "setup" | "push" | "match" | "mismatch" | "empty" | "done";
  /** Index of the closer that failed (mismatch or empty stack). */
  failedAt: number | null;
  /** Set on the final step. */
  verdict: boolean | null;
};
