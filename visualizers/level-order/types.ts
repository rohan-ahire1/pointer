import type { MaxDepthInput, TreeNodeData } from "../max-depth-tree/types";

export type LevelOrderInput = MaxDepthInput;

export type LevelOrderState = {
  nodes: TreeNodeData[];
  /** Node ids on the current level, still to visit. */
  queue: number[];
  /** Node ids collected for the next level. */
  next: number[];
  level: number[];
  out: number[][];
  current: number | null;
  /** The child just added to `next`. */
  added: number | null;
  phase: "setup" | "level" | "visit" | "child" | "close" | "done";
};
