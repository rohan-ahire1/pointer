export type CourseInput = {
  n: number;
  /** [before, after]: take `before` first. */
  edges: [number, number][];
};

export type CourseState = {
  n: number;
  edges: [number, number][];
  needs: number[];
  ready: number[];
  taken: number[];
  current: number | null;
  /** Index into edges: the link being crossed off. */
  crossing: number | null;
  /** Edges already crossed off. */
  crossed: number[];
  canFinish: boolean | null;
  phase: "setup" | "count" | "ready" | "take" | "cross" | "done";
};
