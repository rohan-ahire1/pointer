export const code: string[] = [
  "function spiralOrder(grid: number[][]): number[] {", // 0
  "  const out: number[] = [];", // 1
  "  let top = 0, bottom = grid.length - 1;", // 2
  "  let left = 0, right = grid[0].length - 1;", // 3
  "  while (top <= bottom && left <= right) {", // 4
  "    for (let c = left; c <= right; c++) out.push(grid[top][c]);", // 5
  "    top++;", // 6
  "    for (let r = top; r <= bottom; r++) out.push(grid[r][right]);", // 7
  "    right--;", // 8
  "    if (top <= bottom) {", // 9
  "      for (let c = right; c >= left; c--) out.push(grid[bottom][c]);", // 10
  "      bottom--;", // 11
  "    }", // 12
  "    if (left <= right) {", // 13
  "      for (let r = bottom; r >= top; r--) out.push(grid[r][left]);", // 14
  "      left++;", // 15
  "    }", // 16
  "  }", // 17
  "  return out;", // 18
  "}", // 19
];
