import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def rotate(matrix: list[list[int]]) -> None:",
    "    n = len(matrix)",
    "    for i in range(n):",
    "        for j in range(i + 1, n):",
    "            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]",
    "    for i in range(n):",
    "        left, right = 0, n - 1",
    "        while left < right:",
    "            matrix[i][left], matrix[i][right] = matrix[i][right], matrix[i][left]",
    "            left += 1",
    "            right -= 1",
  ],
  lines: [0, 1, 2, 3, 4, -1, -1, 5, 6, 7, 8, 9, 10, -1, -1, -1],
};
