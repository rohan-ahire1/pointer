import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def unique_paths(m: int, n: int) -> int:",
    "    dp = [[1] * n for _ in range(m)]",
    "    for r in range(1, m):",
    "        for c in range(1, n):",
    "            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]",
    "    return dp[m - 1][n - 1]",
  ],
  lines: [0, 1, 2, 3, 4, -1, -1, 5, -1],
};
