/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/12-1-d-dp.md.
 */
export const code: string[] = [
  "function rob(nums: number[]): number {", // 0
  "  const dp: number[] = new Array(nums.length + 1).fill(0);", // 1
  "  dp[1] = nums[0];", // 2
  "  for (let i = 2; i <= nums.length; i++) {", // 3
  "    const skip = dp[i - 1];", // 4
  "    const take = dp[i - 2] + nums[i - 1];", // 5
  "    dp[i] = Math.max(skip, take);", // 6
  "  }", // 7
  "  return dp[nums.length];", // 8
  "}", // 9
];
