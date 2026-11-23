import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { NonOverlappingInput, NonOverlappingState } from "./types";
import { NonOverlappingIntervalsView } from "./View";

export const nonOverlappingIntervalsVisualizer: Visualizer<NonOverlappingInput, NonOverlappingState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: NonOverlappingIntervalsView,
};
