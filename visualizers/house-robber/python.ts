import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def rob(nums: list[int]) -> int:",
    "    dp = [0] * (len(nums) + 1)",
    "    dp[1] = nums[0]",
    "    for i in range(2, len(nums) + 1):",
    "        skip = dp[i - 1]",
    "        take = dp[i - 2] + nums[i - 1]",
    "        dp[i] = max(skip, take)",
    "    return dp[len(nums)]",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, -1, 7, -1],
};
