export const code: string[] = [
  "function uniquePaths(m: number, n: number): number {", // 0
  "  const dp = Array.from({ length: m }, () => new Array(n).fill(1));", // 1
  "  for (let r = 1; r < m; r++) {", // 2
  "    for (let c = 1; c < n; c++) {", // 3
  "      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];", // 4
  "    }", // 5
  "  }", // 6
  "  return dp[m - 1][n - 1];", // 7
  "}", // 8
];
