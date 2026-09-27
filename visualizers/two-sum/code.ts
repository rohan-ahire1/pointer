/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/01-arrays-and-hashing.md.
 */
export const code: string[] = [
  "function twoSum(nums: number[], target: number): number[] {", // 0
  "  const seen = new Map<number, number>();", // 1
  "  for (let i = 0; i < nums.length; i++) {", // 2
  "    const need = target - nums[i];", // 3
  "    if (seen.has(need)) {", // 4
  "      return [seen.get(need)!, i];", // 5
  "    }", // 6
  "    seen.set(nums[i], i);", // 7
  "  }", // 8
  "  return [];", // 9
  "}", // 10
];
