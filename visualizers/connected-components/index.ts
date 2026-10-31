import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { ComponentsInput, ComponentsState } from "./types";
import { ConnectedComponentsView } from "./View";

export const connectedComponentsVisualizer: Visualizer<ComponentsInput, ComponentsState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: ConnectedComponentsView,
};
