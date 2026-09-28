import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { MergeInput, MergeState } from "./types";
import { MergeIntervalsView } from "./View";

export const mergeIntervalsVisualizer: Visualizer<MergeInput, MergeState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: MergeIntervalsView,
};
