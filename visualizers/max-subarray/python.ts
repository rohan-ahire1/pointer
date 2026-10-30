import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def max_sub_array(nums: list[int]) -> int:",
    "    best = nums[0]",
    "    total = 0",
    "    for n in nums:",
    "        if total < 0:",
    "            total = 0",
    "        total += n",
    "        best = max(best, total)",
    "    return best",
  ],
  lines: [0, 1, 2, 3, 5, 6, 7, -1, 8, -1],
};
