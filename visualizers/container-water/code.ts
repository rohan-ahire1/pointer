/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/02-two-pointers.md.
 */
export const code: string[] = [
  "function maxArea(height: number[]): number {", // 0
  "  let left = 0, right = height.length - 1;", // 1
  "  let best = 0;", // 2
  "  while (left < right) {", // 3
  "    const h = Math.min(height[left], height[right]);", // 4
  "    best = Math.max(best, h * (right - left));", // 5
  "    if (height[left] < height[right]) left++;", // 6
  "    else right--;", // 7
  "  }", // 8
  "  return best;", // 9
  "}", // 10
];
