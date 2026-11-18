export type LruCall = { op: "get"; key: number } | { op: "put"; key: number; value: number };

export type LruInput = { capacity: number; calls: LruCall[] };

export type LruState = {
  capacity: number;
  calls: LruCall[];
  /** The call running now, or -1 before the first. */
  call: number;
  /** The list between the two sentinels, oldest first. */
  list: { key: number; value: number }[];
  /** The key the current step touches, and the one just evicted. */
  key: number | null;
  evicted: number | null;
  /** What each get returned so far, by call index. */
  results: (number | null)[];
  phase: "setup" | "hit" | "miss" | "update" | "insert" | "evict" | "done";
};
