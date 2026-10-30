import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def longest(s: str) -> int:",
    "    seen = set()",
    "    left = best = 0",
    "",
    "    for r in range(len(s)):",
    "        while s[r] in seen:",
    "            seen.remove(s[left])",
    "            left += 1",
    "        seen.add(s[r])",
    "        best = max(best, r - left + 1)",
    "    return best",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, 7, -1, 8, 9, -1, 10, -1],
};
