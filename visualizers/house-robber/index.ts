import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { RobberInput, RobberState } from "./types";
import { HouseRobberView } from "./View";

export const houseRobberVisualizer: Visualizer<RobberInput, RobberState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: HouseRobberView,
};
