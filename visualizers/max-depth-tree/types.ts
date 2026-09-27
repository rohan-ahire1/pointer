/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

export type TreeNodeData = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  /** Heap position: root 1, children 2p and 2p + 1. Used for layout. */
  pos: number;
  /** Root is depth 1. */
  depth: number;
};

/** Parsed input: nodes (any order) and the root id. */
export type MaxDepthInput = { nodes: TreeNodeData[]; root: number };

export type MaxDepthState = {
  nodes: TreeNodeData[];
  /** Call stack of node ids, root first. */
  stack: number[];
  /** Node id -> its answered depth. */
  answers: Record<number, number>;
  current: number | null;
  /** A missing child being checked on a "missing" step. */
  probe: { parent: number; side: "left" | "right" } | null;
  phase: "setup" | "enter" | "leaf" | "missing" | "return" | "done";
  answer: number | null;
};
