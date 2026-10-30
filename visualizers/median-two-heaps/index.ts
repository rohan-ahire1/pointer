import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { MedianInput, MedianState } from "./types";
import { MedianTwoHeapsView } from "./View";

export const medianTwoHeapsVisualizer: Visualizer<MedianInput, MedianState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: MedianTwoHeapsView,
};
