import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { WordSearchInput, WordSearchState } from "./types";
import { WordSearchView } from "./View";

export const wordSearchVisualizer: Visualizer<WordSearchInput, WordSearchState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: WordSearchView,
};
