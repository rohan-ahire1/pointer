import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { CycleInput, CycleState } from "./types";
import { LinkedListCycleView } from "./View";

export const linkedListCycleVisualizer: Visualizer<CycleInput, CycleState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: LinkedListCycleView,
};
