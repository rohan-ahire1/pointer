import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { ReverseInput, ReverseState } from "./types";
import { ReverseLinkedListView } from "./View";

export const reverseLinkedListVisualizer: Visualizer<ReverseInput, ReverseState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: ReverseLinkedListView,
};
