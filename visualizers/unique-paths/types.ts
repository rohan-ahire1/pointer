export type UniquePathsInput = { m: number; n: number };

export type UniquePathsState = {
  m: number;
  n: number;
  /** null until the cell is worked out. */
  dp: (number | null)[][];
  r: number;
  c: number;
  phase: "setup" | "cell" | "done";
};
