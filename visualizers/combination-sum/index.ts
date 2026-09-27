import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { CombinationInput, CombinationState } from "./types";
import { CombinationSumView } from "./View";

export const combinationSumVisualizer: Visualizer<CombinationInput, CombinationState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: CombinationSumView,
};
