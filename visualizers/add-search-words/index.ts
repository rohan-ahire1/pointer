import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { AddSearchInput, AddSearchState } from "./types";
import { AddSearchWordsView } from "./View";

export const addSearchWordsVisualizer: Visualizer<AddSearchInput, AddSearchState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: AddSearchWordsView,
};
