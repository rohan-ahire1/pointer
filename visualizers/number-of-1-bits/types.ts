export type BitsInput = { n: number };

export type BitsState = {
  n: number;
  /** n - 1, once it's been worked out. */
  below: number | null;
  /** n & (n - 1), once it's been worked out. */
  result: number | null;
  /** Position of n's lowest 1 bit, counted from the right. */
  lowest: number | null;
  count: number;
  phase: "setup" | "minus" | "and" | "count" | "done";
};
