export type ThreeSumInput = number[];

export type ThreeSumState = {
  nums: number[];
  i: number;
  l: number;
  r: number;
  sum: number | null;
  found: number[][];
  phase: "setup" | "fix" | "skip" | "sum" | "move" | "hit" | "done";
};
