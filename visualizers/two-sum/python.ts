import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def two_sum(nums: list[int], target: int) -> list[int]:",
    "    seen = {}",
    "    for i, x in enumerate(nums):",
    "        need = target - x",
    "        if need in seen:",
    "            return [seen[need], i]",
    "        seen[x] = i",
    "    return []",
  ],
  lines: [0, 1, 2, 3, 4, 5, -1, 6, -1, 7, -1],
};
