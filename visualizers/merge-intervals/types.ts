/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** id = position in the original input (use it as the React key). */
export type IntervalItem = { id: number; start: number; end: number };

/** Parsed input, in input order. */
export type MergeInput = IntervalItem[];

export type MergeState = {
  /** Current display order: input order before the sort step, sorted after. */
  items: IntervalItem[];
  /** Index into `items` being processed. */
  i: number | null;
  /** Merged so far; `from` lists the item ids folded into each. The last one can still grow. */
  merged: { start: number; end: number; from: number[] }[];
  phase: "setup" | "sort" | "seed" | "stretch" | "new" | "done";
  /** What happened to each processed item id. */
  outcomes: Record<number, "seed" | "merged" | "new">;
};
