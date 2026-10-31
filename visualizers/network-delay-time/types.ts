/** [from, to, cost]: a one-way road. */
export type Road = [number, number, number];

export type NetworkInput = {
  n: number;
  roads: Road[];
};

export type NetworkState = {
  n: number;
  roads: Road[];
  /** Best arrival time so far. Null until a road reaches the node. */
  best: (number | null)[];
  /** Nodes whose time is final, in the order they left the heap. */
  settled: number[];
  /** [time, node] entries, smallest first. */
  heap: [number, number][];
  current: number | null;
  /** Index into roads: the road being tried. */
  trying: number | null;
  /** The arrival time that road offers. */
  offer: number | null;
  /** The slowest node's time, or -1 if a node is never reached. */
  delay: number | null;
  phase: "setup" | "pop" | "skip" | "road" | "done";
};
