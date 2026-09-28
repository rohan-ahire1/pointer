import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { LcsInput, LcsState } from "./types";
import { LcsView } from "./View";

export const lcsVisualizer: Visualizer<LcsInput, LcsState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: LcsView,
};
