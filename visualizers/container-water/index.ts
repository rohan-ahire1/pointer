import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { ContainerInput, ContainerState } from "./types";
import { ContainerWaterView } from "./View";

export const containerWaterVisualizer: Visualizer<ContainerInput, ContainerState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: ContainerWaterView,
};
