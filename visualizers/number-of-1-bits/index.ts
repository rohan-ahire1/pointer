import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { BitsInput, BitsState } from "./types";
import { NumberOfOneBitsView } from "./View";

export const numberOfOneBitsVisualizer: Visualizer<BitsInput, BitsState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: NumberOfOneBitsView,
};
