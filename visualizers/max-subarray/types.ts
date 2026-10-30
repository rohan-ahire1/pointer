export type MaxSubarrayInput = number[];

export type MaxSubarrayState = {
  nums: number[];
  i: number;
  /** Where the current run starts. */
  start: number;
  sum: number;
  best: number | null;
  bestRange: { start: number; end: number } | null;
  phase: "setup" | "drop" | "add" | "best" | "done";
};
