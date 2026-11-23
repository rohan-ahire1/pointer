export const code: string[] = [
  "function countBits(n: number): number[] {", // 0
  "  const ans: number[] = new Array(n + 1).fill(0);", // 1
  "  for (let i = 1; i <= n; i++) {", // 2
  "    ans[i] = ans[i >> 1] + (i & 1);", // 3
  "  }", // 4
  "  return ans;", // 5
  "}", // 6
];
