export const code: string[] = [
  "function hammingWeight(n: number): number {", // 0
  "  let count = 0;", // 1
  "  while (n !== 0) {", // 2
  "    n &= n - 1;", // 3
  "    count++;", // 4
  "  }", // 5
  "  return count;", // 6
  "}", // 7
];
