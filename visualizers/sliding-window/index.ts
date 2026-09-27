import type { Visualizer } from "../types";
import { code } from "./code";
import { parseInput } from "./parseInput";
import { trace, type SWState } from "./trace";
import { SlidingWindowView } from "./View";

/** Matches patterns.json's sliding-window entry: `"visualizer": "longest-substring-no-repeat"`. */
export const SLIDING_WINDOW_VISUALIZER_ID = "longest-substring-no-repeat";

export const slidingWindowVisualizer: Visualizer<string, SWState> = {
  id: SLIDING_WINDOW_VISUALIZER_ID,
  title: "Longest Substring Without Repeating Characters",
  code,
  parseInput,
  presets: ["abcabcbb", "bbbbb", "pwwkew"],
  trace,
  View: SlidingWindowView,
  inputLabel: "s =",
  inputHint: "Lowercase letters a–z, up to 10. Anything else is ignored.",
};

export { code, parseInput, trace, SlidingWindowView };
export type { SWState };
