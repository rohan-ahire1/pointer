import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def max_area(height: list[int]) -> int:",
    "    left, right = 0, len(height) - 1",
    "    best = 0",
    "    while left < right:",
    "        h = min(height[left], height[right])",
    "        best = max(best, h * (right - left))",
    "        if height[left] < height[right]:",
    "            left += 1",
    "        else:",
    "            right -= 1",
    "    return best",
  ],
  lines: [0, 1, 2, 3, 4, 5, 7, 9, -1, 10, -1],
};
