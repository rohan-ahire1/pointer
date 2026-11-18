import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { OrangesInput, OrangesState } from "./types";
import { RottingOrangesView } from "./View";

export const rottingOrangesVisualizer: Visualizer<OrangesInput, OrangesState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: RottingOrangesView,
};
