import type { Visualizer } from "../types";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";
import type { CourseInput, CourseState } from "./types";
import { CourseScheduleView } from "./View";

export const courseScheduleVisualizer: Visualizer<CourseInput, CourseState> = {
  ...meta,
  presets: [...meta.presets],
  code,
  python,
  parseInput,
  trace,
  View: CourseScheduleView,
};
