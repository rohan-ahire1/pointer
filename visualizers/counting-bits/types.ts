export type CountingBitsInput = { n: number };

export type CountingBitsState = {
  n: number;
  /** ans so far: a number once filled in, null while still waiting. */
  ans: (number | null)[];
  /** The index being filled in. */
  i: number | null;
  /** i >> 1: i with its last bit dropped, whose answer is reused. */
  half: number | null;
  /** i & 1: the dropped bit, 0 or 1. */
  last: number | null;
  phase: "setup" | "look" | "fill" | "done";
};
