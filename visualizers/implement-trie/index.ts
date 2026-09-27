import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { TrieInput, TrieState } from "./types";
import { ImplementTrieView } from "./View";

export const implementTrieVisualizer: Visualizer<TrieInput, TrieState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  parseInput,
  trace,
  View: ImplementTrieView,
};
