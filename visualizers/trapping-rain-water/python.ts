import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def trap(height: list[int]) -> int:",
    "    stack = []  # bars that could be a left wall",
    "    water = 0",
    "    for i, h in enumerate(height):",
    "        while stack and h > height[stack[-1]]:",
    "            floor = stack.pop()",
    "            if not stack:",
    "                break  # no left wall: it runs off",
    "            left = stack[-1]",
    "            depth = min(height[left], h) - height[floor]",
    "            water += depth * (i - left - 1)",
    "        stack.append(i)",
    "    return water",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, -1, 11, -1, 12, -1],
};
