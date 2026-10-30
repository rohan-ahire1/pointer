import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { ParensInput, ParensState } from "./types";
import { ValidParenthesesView } from "./View";

export const validParenthesesVisualizer: Visualizer<ParensInput, ParensState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: ValidParenthesesView,
};
