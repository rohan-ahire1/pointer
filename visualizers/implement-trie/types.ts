/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * See docs/patterns for the design. trace() must fill every field on every step.
 */

/** Parsed input. */
export type TrieInput = { words: string[]; query: string };

export type TrieNodeData = {
  id: number;
  /** "" for the root. */
  ch: string;
  parent: number | null;
  isWord: boolean;
};

export type TrieState = {
  words: string[];
  query: string;
  /** Every node so far, root first (id 0). */
  nodes: TrieNodeData[];
  cursor: number | null;
  phase: "setup" | "new" | "reuse" | "mark" | "walk" | "fail" | "verdict" | "done";
  /** Word being inserted (index into words); null during the lookup. */
  wordIndex: number | null;
  /** Letter index within the current word, or within the query during the lookup. */
  charIndex: number | null;
  /** Node created on this step. */
  created: number | null;
  /** The letter that wasn't found on a fail step. */
  missing: string | null;
  result: { search: boolean; startsWith: boolean } | null;
};
