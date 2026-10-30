import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { TemperaturesInput, TemperaturesState } from "./types";
import { DailyTemperaturesView } from "./View";

export const dailyTemperaturesVisualizer: Visualizer<TemperaturesInput, TemperaturesState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: DailyTemperaturesView,
};
