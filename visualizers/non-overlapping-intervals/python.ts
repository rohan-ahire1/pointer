import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def erase_overlap_intervals(intervals: list[list[int]]) -> int:",
    "    intervals.sort(key=lambda x: x[1])",
    "    last_end = intervals[0][1]",
    "    removed = 0",
    "    for i in range(1, len(intervals)):",
    "        start, end = intervals[i]",
    "        if start >= last_end:",
    "            last_end = end",
    "        else:",
    "            removed += 1",
    "    return removed",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, -1, -1, 10, -1],
};
