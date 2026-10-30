export type WordSearchInput = { board: string[][]; word: string };

export type Spot = [row: number, col: number];

export type WordSearchState = {
  board: string[][];
  word: string;
  path: Spot[];
  /** The cell that just failed and was given back. */
  dead: Spot | null;
  /** Every start cell tried so far. */
  starts: Spot[];
  found: boolean | null;
  phase: "setup" | "start" | "match" | "back" | "found" | "done";
};
