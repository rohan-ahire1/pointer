import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def min_eating_speed(piles: list[int], h: int) -> int:",
    "    lo, hi = 1, max(piles)",
    "    while lo < hi:",
    "        k = (lo + hi) // 2",
    "        hours = 0",
    "        for p in piles:",
    "            hours += (p + k - 1) // k  # round up",
    "        if hours <= h:",
    "            hi = k  # fast enough: try slower",
    "        else:",
    "            lo = k + 1  # too slow: go faster",
    "    return lo",
  ],
  lines: [0, 1, 2, 3, 4, 6, 8, 10, -1, 11, -1],
};
