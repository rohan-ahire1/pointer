import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { ThreeSumInput, ThreeSumState } from "./types";
import { ThreeSumView } from "./View";

export const threeSumVisualizer: Visualizer<ThreeSumInput, ThreeSumState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: ThreeSumView,
};
