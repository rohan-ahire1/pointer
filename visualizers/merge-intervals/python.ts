import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def merge(intervals: list[list[int]]) -> list[list[int]]:",
    "    intervals.sort(key=lambda x: x[0])",
    "    merged = [intervals[0]]",
    "    for i in range(1, len(intervals)):",
    "        last = merged[-1]",
    "        start, end = intervals[i]",
    "        if start <= last[1]:",
    "            last[1] = max(last[1], end)",
    "        else:",
    "            merged.append([start, end])",
    "    return merged",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -1, 10, -1],
};
