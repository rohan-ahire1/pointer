import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def can_jump(nums: list[int]) -> bool:",
    "    reach = 0",
    "    for i, n in enumerate(nums):",
    "        if i > reach:",
    "            return False",
    "        reach = max(reach, i + n)",
    "    return True",
  ],
  lines: [0, 1, 2, 3, 5, -1, 6, -1],
};
