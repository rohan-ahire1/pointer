export type CycleInput = {
  values: number[];
  /** Index the tail links back to, or -1 when the list simply ends. */
  pos: number;
};

export type CycleState = {
  values: number[];
  pos: number;
  slow: number | null;
  fast: number | null;
  moves: number;
  hasCycle: boolean | null;
  phase: "setup" | "slow" | "fast" | "meet" | "end" | "done";
};
