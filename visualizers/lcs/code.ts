/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/13-2-d-dp.md.
 */
export const code: string[] = [
  "function lcs(a: string, b: string): number {", // 0
  "  const dp = Array.from({ length: a.length + 1 }, () =>", // 1
  "    new Array(b.length + 1).fill(0));", // 2
  "  for (let i = 1; i <= a.length; i++) {", // 3
  "    for (let j = 1; j <= b.length; j++) {", // 4
  "      if (a[i - 1] === b[j - 1]) {", // 5
  "        dp[i][j] = dp[i - 1][j - 1] + 1;", // 6
  "      } else {", // 7
  "        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);", // 8
  "      }", // 9
  "    }", // 10
  "  }", // 11
  "  return dp[a.length][b.length];", // 12
  "}", // 13
];
