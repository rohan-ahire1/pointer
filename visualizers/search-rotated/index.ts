import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { SearchRotatedInput, SearchRotatedState } from "./types";
import { SearchRotatedView } from "./View";

export const searchRotatedVisualizer: Visualizer<SearchRotatedInput, SearchRotatedState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: SearchRotatedView,
};
