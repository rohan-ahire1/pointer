/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input: wall heights. */
export type ContainerInput = number[];

export type ContainerState = {
  height: number[];
  left: number;
  right: number;
  phase: "setup" | "measure" | "move" | "done";
  /** Water height and area for the current left/right pair; null on setup and done. */
  h: number | null;
  area: number | null;
  best: number;
  /** The pair that produced `best`. */
  bestPair: [number, number] | null;
  /** True on a measure step whose area beat the previous best. */
  newBest: boolean;
  /** On a move step: the wall that is about to move inward. */
  moving: "left" | "right" | null;
};
