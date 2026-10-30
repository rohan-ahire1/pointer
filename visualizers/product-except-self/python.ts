import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def product_except_self(nums: list[int]) -> list[int]:",
    "    out = [1] * len(nums)",
    "    left = 1",
    "    for i in range(len(nums)):",
    "        out[i] = left",
    "        left *= nums[i]",
    "    right = 1",
    "    for i in range(len(nums) - 1, -1, -1):",
    "        out[i] *= right",
    "        right *= nums[i]",
    "    return out",
  ],
  lines: [0, 1, 2, 3, 4, 5, -1, 6, 7, 8, 9, -1, 10, -1],
};
