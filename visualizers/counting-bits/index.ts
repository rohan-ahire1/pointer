import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { CountingBitsInput, CountingBitsState } from "./types";
import { CountingBitsView } from "./View";

export const countingBitsVisualizer: Visualizer<CountingBitsInput, CountingBitsState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: CountingBitsView,
};
