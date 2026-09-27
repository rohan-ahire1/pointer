import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { TwoSumInput, TwoSumState } from "./types";
import { TwoSumView } from "./View";

export const twoSumVisualizer: Visualizer<TwoSumInput, TwoSumState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: TwoSumView,
};
