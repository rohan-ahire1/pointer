export type ComponentsInput = {
  n: number;
  links: [number, number][];
};

export type ComponentsState = {
  n: number;
  links: [number, number][];
  /** parent[x] points toward x's leader. A leader points at itself. */
  parent: number[];
  /** Index into links: the one being read. */
  link: number | null;
  /** Nodes walked on the way to the two leaders. */
  path: number[];
  /** The two leaders found for the current link. */
  leaders: [number, number] | null;
  groups: number;
  phase: "setup" | "find" | "join" | "same" | "done";
};
