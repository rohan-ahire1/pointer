import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { LcsInput, LcsState } from "./types";
import { LcsView } from "./View";

export const lcsVisualizer: Visualizer<LcsInput, LcsState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: LcsView,
};
