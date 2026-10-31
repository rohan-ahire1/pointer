import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { NetworkInput, NetworkState } from "./types";
import { NetworkDelayView } from "./View";

export const networkDelayVisualizer: Visualizer<NetworkInput, NetworkState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: NetworkDelayView,
};
