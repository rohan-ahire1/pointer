import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { LevelOrderInput, LevelOrderState } from "./types";
import { LevelOrderView } from "./View";

export const levelOrderVisualizer: Visualizer<LevelOrderInput, LevelOrderState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: LevelOrderView,
};
