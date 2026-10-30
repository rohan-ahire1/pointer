export type SearchRotatedInput = { nums: number[]; target: number };

export type SearchRotatedState = {
  nums: number[];
  target: number;
  lo: number;
  hi: number;
  mid: number | null;
  /** Which half is in order on this step. */
  sorted: "left" | "right" | null;
  answer: number | null;
  phase: "setup" | "mid" | "side" | "narrow" | "done";
};
