import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { KokoInput, KokoState } from "./types";
import { KokoView } from "./View";

export const kokoEatingBananasVisualizer: Visualizer<KokoInput, KokoState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: KokoView,
};
