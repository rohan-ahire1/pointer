/** State contract between this visualizer's trace and its View. */

/** Parsed input: 0 empty, 1 fresh, 2 rotten. */
export type OrangesInput = number[][];

export type Cell = [row: number, col: number];

export type OrangesState = {
  /** The grid as the code sees it now. */
  grid: number[][];
  /** The minute each rotten orange went bad (0 for the ones that start rotten). */
  rotAt: (number | null)[][];
  /** Queue contents from head onwards, front first. */
  queue: Cell[];
  /** How many queued oranges belong to the minute being run (the rest rotted during it). */
  front: number;
  /** The rotten orange spreading on this step. */
  current: Cell | null;
  /** Fresh neighbours it rotted on this step. */
  justRotted: Cell[];
  fresh: number;
  minutes: number;
  answer: number | null;
  phase: "setup" | "spread" | "tick" | "done";
};
