import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { RotateInput, RotateState } from "./types";
import { RotateImageView } from "./View";

export const rotateImageVisualizer: Visualizer<RotateInput, RotateState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: RotateImageView,
};
