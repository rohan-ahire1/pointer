import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def hamming_weight(n: int) -> int:",
    "    count = 0",
    "    while n != 0:",
    "        n &= n - 1",
    "        count += 1",
    "    return count",
  ],
  lines: [0, 1, 2, 3, 4, -1, 5, -1],
};
