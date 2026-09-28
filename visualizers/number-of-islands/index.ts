import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { IslandsInput, IslandsState } from "./types";
import { NumberOfIslandsView } from "./View";

export const numberOfIslandsVisualizer: Visualizer<IslandsInput, IslandsState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: NumberOfIslandsView,
};
