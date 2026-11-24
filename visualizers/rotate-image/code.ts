/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 */
export const code: string[] = [
  "function rotate(matrix: number[][]): void {", // 0
  "  const n = matrix.length;", // 1
  "  for (let i = 0; i < n; i++) {", // 2
  "    for (let j = i + 1; j < n; j++) {", // 3
  "      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];", // 4
  "    }", // 5
  "  }", // 6
  "  for (let i = 0; i < n; i++) {", // 7
  "    let left = 0, right = n - 1;", // 8
  "    while (left < right) {", // 9
  "      [matrix[i][left], matrix[i][right]] = [matrix[i][right], matrix[i][left]];", // 10
  "      left++;", // 11
  "      right--;", // 12
  "    }", // 13
  "  }", // 14
  "}", // 15
];
