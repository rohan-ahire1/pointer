import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { KthLargestInput, KthLargestState } from "./types";
import { KthLargestView } from "./View";

export const kthLargestVisualizer: Visualizer<KthLargestInput, KthLargestState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: KthLargestView,
};
