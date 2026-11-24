/**
 * State contract between this visualizer's trace (steps and narration) and its View.
 * trace() must fill every field on every step.
 */

/** Parsed input: the words to add and one search pattern ("." matches any letter). */
export type AddSearchInput = { words: string[]; pattern: string };

export type TrieNodeData = {
  id: number;
  /** "" for the root. */
  ch: string;
  parent: number | null;
  isWord: boolean;
};

export type AddSearchState = {
  words: string[];
  pattern: string;
  /** Every node so far, root first (id 0). At most 26 (the root plus 25 letters). */
  nodes: TrieNodeData[];
  cursor: number | null;
  phase: "setup" | "new" | "reuse" | "mark" | "start" | "walk" | "wild" | "dead" | "found" | "done";
  /** Word being added (index into words); null during the search. */
  wordIndex: number | null;
  /** Letter index within the current word, or within the pattern during the search. */
  charIndex: number | null;
  /** Node created on this step. */
  created: number | null;
  /** The letter that wasn't found on a dead-end step, drawn as a ghost under the cursor. */
  missing: string | null;
  /** Nodes where the search has run out of options, so far. */
  dead: number[];
  /** null until the search ends. */
  result: boolean | null;
};
