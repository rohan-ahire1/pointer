/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input: node values, head first. */
export type ReverseInput = number[];

export type ReverseState = {
  values: number[];
  /** next[k] = index of node k's next node, or null. Starts [1, 2, …, null]. */
  next: (number | null)[];
  prev: number | null;
  curr: number | null;
  /** The saved `next` pointer from the loop. */
  nxt: number | null;
  phase: "setup" | "save" | "flip" | "advance" | "done";
  /** On a flip step: the node whose arrow changes. */
  flipping: number | null;
  /** Indices whose arrow has been flipped so far. */
  reversed: number[];
};
