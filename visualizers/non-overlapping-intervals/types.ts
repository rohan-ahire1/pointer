/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * trace() must fill every field on every step.
 */

/** id = position in the original input (use it as the React key). */
export type IntervalItem = { id: number; start: number; end: number };

/** Parsed input, in input order. */
export type NonOverlappingInput = IntervalItem[];

export type NonOverlappingState = {
  /** Current display order: input order before the sort step, sorted by end after. */
  items: IntervalItem[];
  /** Index into `items` being processed. */
  i: number | null;
  /** End of the last kept interval, or null before one is kept. */
  lastEnd: number | null;
  /** Ids of the kept intervals, in the order they were kept. */
  kept: number[];
  /** How many intervals have been removed so far. */
  removed: number;
  phase: "setup" | "sort" | "seed" | "keep" | "remove" | "done";
  /** What happened to each processed item id. */
  outcomes: Record<number, "seed" | "kept" | "removed">;
};
