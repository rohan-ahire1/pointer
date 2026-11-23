import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def count_bits(n: int) -> list[int]:",
    "    ans = [0] * (n + 1)",
    "    for i in range(1, n + 1):",
    "        ans[i] = ans[i >> 1] + (i & 1)",
    "    return ans",
  ],
  lines: [0, 1, 2, 3, -1, 4, -1],
};
