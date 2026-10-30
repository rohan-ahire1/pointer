export const code: string[] = [
  "function maxSubArray(nums: number[]): number {", // 0
  "  let best = nums[0];", // 1
  "  let sum = 0;", // 2
  "  for (const n of nums) {", // 3
  "    if (sum < 0) sum = 0;", // 4
  "    sum += n;", // 5
  "    best = Math.max(best, sum);", // 6
  "  }", // 7
  "  return best;", // 8
  "}", // 9
];
