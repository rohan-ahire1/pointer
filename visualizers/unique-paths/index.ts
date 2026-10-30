import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { UniquePathsInput, UniquePathsState } from "./types";
import { UniquePathsView } from "./View";

export const uniquePathsVisualizer: Visualizer<UniquePathsInput, UniquePathsState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: UniquePathsView,
};
