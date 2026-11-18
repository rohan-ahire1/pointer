export type SubarraySumInput = { nums: number[]; k: number };

export type SubarraySumState = {
  nums: number[];
  k: number;
  /** Index being added, or -1 before the loop and at the end. */
  i: number;
  prefix: number;
  /** The earlier prefix that would close a subarray here: prefix - k. */
  need: number | null;
  /** How many times `need` was in the map on this step. */
  hits: number | null;
  count: number;
  /** The map, in the order sums first went in. */
  seen: { sum: number; times: number }[];
  /** Prefix sum after each index added so far. */
  prefixes: number[];
  /** Subarrays (start, end, inclusive) this step found. */
  found: [number, number][];
  phase: "setup" | "look" | "store" | "done";
};
