/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input: land[r][c] is true for "1". */
export type IslandsInput = boolean[][];

export type Cell = [row: number, col: number];

export type IslandsState = {
  land: boolean[][];
  /** Island number (1-based) once a land cell is claimed. */
  owner: (number | null)[][];
  /** Queue contents, front first. */
  queue: Cell[];
  /** Cell being explored (dequeued) on this step. */
  current: Cell | null;
  /** Where the row-by-row scan is. */
  scan: Cell | null;
  /** Neighbours enqueued on this step. */
  justAdded: Cell[];
  islands: number;
  phase: "setup" | "new" | "explore" | "done";
};
