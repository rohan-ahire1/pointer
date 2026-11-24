/** A square grid of numbers from 0 to 99. */
export type RotateInput = number[][];

export type RotateState = {
  /** The grid as it stands now, after any swap made on this step. */
  matrix: number[][];
  /** The two cells just swapped, as [row, column], or null on steps with no swap. */
  pair: [[number, number], [number, number]] | null;
  /** The row being flipped in the second phase, otherwise null. */
  row: number | null;
  /** Swaps made so far, across both phases. */
  swaps: number;
  phase: "setup" | "transpose" | "flip" | "done";
};
