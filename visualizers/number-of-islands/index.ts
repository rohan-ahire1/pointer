import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { IslandsInput, IslandsState } from "./types";
import { NumberOfIslandsView } from "./View";

export const numberOfIslandsVisualizer: Visualizer<IslandsInput, IslandsState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: NumberOfIslandsView,
};
