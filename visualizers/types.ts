import type { ComponentType } from "react";

/**
 * One meaningful moment in a traced algorithm run. See
 * design/visualizer-spec.md — the same steps drive both the step-through
 * visualizer and (later) the explainer videos, so the site and the videos
 * always agree.
 */
export type Step<S> = {
  /** Everything the view needs to draw this moment. */
  state: S;
  /** 0-based lines of `Visualizer["code"]` to highlight for this step. */
  lines: number[];
  /** Plain-English narration shown in the bubble. */
  note: string;
  /** Extra screen-reader summary, e.g. `Step 9 of 22. Window is "bca". Best so far 3.` */
  sr: string;
};

/** A visualizer's solution in Python. */
export type PythonCode = {
  code: string[];
  /**
   * For each TypeScript line, the Python line it runs as, or -1 when Python has
   * no counterpart (a closing brace, say). Same length as `Visualizer["code"]`.
   */
  lines: number[];
};

/**
 * A single pattern-specific visualizer. `trace` is pure and deterministic —
 * given the same parsed input it always returns the same steps — so it's
 * unit tested directly; the shared `<VisualizerPlayer>` (visualizers/player)
 * owns everything else: input handling, presets, playback controls, speed,
 * keyboard shortcuts, the step counter, the narration bubble and the code
 * panel.
 */
export type Visualizer<I, S> = {
  /** Matches a pattern's `visualizer` field in content/patterns.json. */
  id: string;
  /** e.g. "Longest Substring Without Repeating Characters". */
  title: string;
  /** Short name for the picker when a lesson has several, e.g. "3Sum". Falls back to `title`. */
  shortTitle?: string;
  /** TypeScript solution, one entry per line (indices match Step["lines"]). */
  code: string[];
  /** The same solution in Python, with a map so the highlight follows along. */
  python?: PythonCode;
  /** Parses and validates the raw input field value. */
  parseInput(raw: string): I | { error: string };
  /** Example inputs shown as chips. */
  presets: string[];
  /** Pure and deterministic — unit test this. */
  trace(input: I): Step<S>[];
  View: ComponentType<{ step: Step<S>; input: I }>;
  /**
   * Copy for the shared player's input field (not in the spec's minimal
   * shape, but needed so <VisualizerPlayer> can render the exact label/hint
   * from the mocks — e.g. "s =" and "Lowercase letters a–z, up to 10.
   * Anything else is ignored." — without hardcoding one visualizer's
   * wording into the shared component). Both optional; the player falls
   * back to a generic label when omitted.
   */
  inputLabel?: string;
  inputHint?: string;
  /** Max characters the input field accepts. Defaults to 10 (Sliding Window's limit). */
  inputMaxLength?: number;
};
