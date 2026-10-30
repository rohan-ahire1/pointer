import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { MergeInput, MergeState } from "./types";
import { MergeIntervalsView } from "./View";

export const mergeIntervalsVisualizer: Visualizer<MergeInput, MergeState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: MergeIntervalsView,
};
