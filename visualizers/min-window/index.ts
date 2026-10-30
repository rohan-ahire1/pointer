import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { MinWindowInput, MinWindowState } from "./types";
import { MinWindowView } from "./View";

export const minWindowVisualizer: Visualizer<MinWindowInput, MinWindowState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: MinWindowView,
};
