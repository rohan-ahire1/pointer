import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { LruInput, LruState } from "./types";
import { LruCacheView } from "./View";

export const lruCacheVisualizer: Visualizer<LruInput, LruState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: LruCacheView,
};
