import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { CoinChangeInput, CoinChangeState } from "./types";
import { CoinChangeView } from "./View";

export const coinChangeVisualizer: Visualizer<CoinChangeInput, CoinChangeState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: CoinChangeView,
};
