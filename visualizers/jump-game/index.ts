import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { JumpInput, JumpState } from "./types";
import { JumpGameView } from "./View";

export const jumpGameVisualizer: Visualizer<JumpInput, JumpState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: JumpGameView,
};
