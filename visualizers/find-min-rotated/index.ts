import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { FindMinInput, FindMinState } from "./types";
import { FindMinRotatedView } from "./View";

export const findMinRotatedVisualizer: Visualizer<FindMinInput, FindMinState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: FindMinRotatedView,
};
