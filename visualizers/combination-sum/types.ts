/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input. */
export type CombinationInput = { candidates: number[]; target: number };

export type CombinationNode = {
  id: number;
  parent: number | null;
  /** The number picked on the edge into this node; null for the root. */
  pick: number | null;
  /** What's still needed at this node (negative for a cut node). */
  remaining: number;
  status: "open" | "path" | "found" | "cut" | "done";
};

export type CombinationState = {
  /** Sorted ascending. */
  candidates: number[];
  target: number;
  path: number[];
  remaining: number;
  /** Every node tried so far; the root is id 0. A prune adds a "cut" node for the too-big pick. */
  tree: CombinationNode[];
  current: number;
  phase: "setup" | "try" | "found" | "prune" | "done";
  results: number[][];
};
