export type RainInput = number[];

/** One layer of water, poured when a pop finds walls on both sides. */
export type Layer = {
  /** First and last bar the water sits over. */
  from: number;
  to: number;
  /** Height of the floor it rests on, and of the lower wall it fills up to. */
  base: number;
  top: number;
};

export type RainState = {
  height: number[];
  /** Bars that could still be a left wall, oldest first. Heights never rise from bottom to top. */
  stack: number[];
  i: number;
  /** The floor bar just popped, and the left wall it sits against. */
  floor: number | null;
  left: number | null;
  layers: Layer[];
  /** The layer this step poured, if any. */
  fresh: number | null;
  water: number;
  phase: "setup" | "read" | "fill" | "runoff" | "push" | "done";
};
