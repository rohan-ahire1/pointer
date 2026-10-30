import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { MaxSubarrayInput, MaxSubarrayState } from "./types";
import { MaxSubarrayView } from "./View";

export const maxSubarrayVisualizer: Visualizer<MaxSubarrayInput, MaxSubarrayState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: MaxSubarrayView,
};
