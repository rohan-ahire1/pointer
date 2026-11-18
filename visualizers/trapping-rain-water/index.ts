import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { RainInput, RainState } from "./types";
import { TrappingRainWaterView } from "./View";

export const trappingRainWaterVisualizer: Visualizer<RainInput, RainState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: TrappingRainWaterView,
};
