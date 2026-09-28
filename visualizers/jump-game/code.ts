/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/14-greedy.md.
 */
export const code: string[] = [
  "function canJump(nums: number[]): boolean {", // 0
  "  let reach = 0;", // 1
  "  for (let i = 0; i < nums.length; i++) {", // 2
  "    if (i > reach) return false;", // 3
  "    reach = Math.max(reach, i + nums[i]);", // 4
  "  }", // 5
  "  return true;", // 6
  "}", // 7
];
