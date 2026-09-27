/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input: the stream, in arrival order. */
export type MedianInput = number[];

/** id = the stream index the value came from (use it as the React key). */
export type HeapItem = { id: number; value: number };

export type MedianState = {
  stream: number[];
  /** Stream index being added; -1 on setup. */
  index: number;
  /** Array-backed heaps: index 0 is the top, children 2k + 1 and 2k + 2. */
  low: HeapItem[];
  high: HeapItem[];
  /** Item moving between heaps on this step. */
  moving: number | null;
  phase: "setup" | "push" | "moveUp" | "rebalance" | "median" | "done";
  /** Median after each number added so far. */
  medians: number[];
};
