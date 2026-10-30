import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def coin_change(coins: list[int], amount: int) -> int:",
    "    dp = [inf] * (amount + 1)",
    "    dp[0] = 0",
    "    for a in range(1, amount + 1):",
    "        for coin in coins:",
    "            if coin <= a:",
    "                dp[a] = min(dp[a], dp[a - coin] + 1)",
    "    return -1 if dp[amount] == inf else dp[amount]",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, -1, -1, -1, 7, -1],
};
