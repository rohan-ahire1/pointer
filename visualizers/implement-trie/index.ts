import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { TrieInput, TrieState } from "./types";
import { ImplementTrieView } from "./View";

export const implementTrieVisualizer: Visualizer<TrieInput, TrieState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: ImplementTrieView,
};
