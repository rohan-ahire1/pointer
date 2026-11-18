import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { SubarraySumInput, SubarraySumState } from "./types";
import { SubarraySumView } from "./View";

export const subarraySumVisualizer: Visualizer<SubarraySumInput, SubarraySumState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: SubarraySumView,
};
