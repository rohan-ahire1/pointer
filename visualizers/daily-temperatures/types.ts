export type TemperaturesInput = number[];

export type TemperaturesState = {
  temps: number[];
  out: number[];
  /** Days still waiting for a warmer one, oldest first. */
  stack: number[];
  i: number;
  /** The day just answered. */
  popped: number | null;
  phase: "setup" | "read" | "pop" | "push" | "done";
};
