import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { ReverseInput, ReverseState } from "./types";
import { ReverseLinkedListView } from "./View";

export const reverseLinkedListVisualizer: Visualizer<ReverseInput, ReverseState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: ReverseLinkedListView,
};
