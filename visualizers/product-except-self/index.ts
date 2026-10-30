import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { ProductInput, ProductState } from "./types";
import { ProductExceptSelfView } from "./View";

export const productExceptSelfVisualizer: Visualizer<ProductInput, ProductState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: ProductExceptSelfView,
};
