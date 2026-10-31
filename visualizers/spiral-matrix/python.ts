import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def spiral_order(grid: list[list[int]]) -> list[int]:",
    "    out = []",
    "    top, bottom = 0, len(grid) - 1",
    "    left, right = 0, len(grid[0]) - 1",
    "    while top <= bottom and left <= right:",
    "        for c in range(left, right + 1):",
    "            out.append(grid[top][c])",
    "        top += 1",
    "        for r in range(top, bottom + 1):",
    "            out.append(grid[r][right])",
    "        right -= 1",
    "        if top <= bottom:",
    "            for c in range(right, left - 1, -1):",
    "                out.append(grid[bottom][c])",
    "            bottom -= 1",
    "        if left <= right:",
    "            for r in range(bottom, top - 1, -1):",
    "                out.append(grid[r][left])",
    "            left += 1",
    "    return out",
  ],
  lines: [0, 1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 14, -1, 15, 16, 18, -1, -1, 19, -1],
};
