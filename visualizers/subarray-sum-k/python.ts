import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def subarray_sum(nums: list[int], k: int) -> int:",
    "    seen = {0: 1}  # prefix sum -> times seen",
    "    prefix = count = 0",
    "    for x in nums:",
    "        prefix += x",
    "        # A subarray ending here sums to k once for each earlier prefix of prefix - k.",
    "        count += seen.get(prefix - k, 0)",
    "        seen[prefix] = seen.get(prefix, 0) + 1",
    "    return count",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, 7, -1, 8, -1],
};
