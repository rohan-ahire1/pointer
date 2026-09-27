/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input: the two words. */
export type LcsInput = { a: string; b: string };

export type LcsState = {
  a: string;
  b: string;
  /** (a.length + 1) x (b.length + 1). Zero row and column are filled from setup; null = not filled yet. */
  dp: (number | null)[][];
  i: number | null;
  j: number | null;
  kind: "match" | "carry" | null;
  /** Where the value came from: diagonal (match), or the winning neighbour (carry). */
  from: "diag" | "up" | "left" | null;
  /** Trace-back path of [i, j] cells from the corner; set on the traceback step. */
  path: [number, number][] | null;
  subsequence: string | null;
  phase: "setup" | "fill" | "traceback" | "done";
};
