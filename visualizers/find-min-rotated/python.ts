import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def find_min(nums: list[int]) -> int:",
    "    lo, hi = 0, len(nums) - 1",
    "    while lo < hi:",
    "        mid = (lo + hi) // 2",
    "        if nums[mid] > nums[hi]:",
    "            lo = mid + 1",
    "        else:",
    "            hi = mid",
    "    return nums[lo]",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, 7, -1, -1, 8, -1],
};
