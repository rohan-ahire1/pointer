export const code: string[] = [
  "function subarraySum(nums: number[], k: number): number {", // 0
  "  const seen = new Map<number, number>([[0, 1]]); // prefix sum → times seen", // 1
  "  let prefix = 0, count = 0;", // 2
  "  for (const x of nums) {", // 3
  "    prefix += x;", // 4
  "    // A subarray ending here sums to k once for each earlier prefix of prefix - k.", // 5
  "    count += seen.get(prefix - k) ?? 0;", // 6
  "    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);", // 7
  "  }", // 8
  "  return count;", // 9
  "}", // 10
];
