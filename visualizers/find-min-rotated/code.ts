/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/05-binary-search.md.
 */
export const code: string[] = [
  "function findMin(nums: number[]): number {", // 0
  "  let lo = 0, hi = nums.length - 1;", // 1
  "  while (lo < hi) {", // 2
  "    const mid = Math.floor((lo + hi) / 2);", // 3
  "    if (nums[mid] > nums[hi]) {", // 4
  "      lo = mid + 1;", // 5
  "    } else {", // 6
  "      hi = mid;", // 7
  "    }", // 8
  "  }", // 9
  "  return nums[lo];", // 10
  "}", // 11
];
