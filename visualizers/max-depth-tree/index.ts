import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { MaxDepthInput, MaxDepthState } from "./types";
import { MaxDepthTreeView } from "./View";

export const maxDepthTreeVisualizer: Visualizer<MaxDepthInput, MaxDepthState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: MaxDepthTreeView,
};
