import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def three_sum(nums: list[int]) -> list[list[int]]:",
    "    nums.sort()",
    "    out = []",
    "    for i in range(len(nums) - 2):",
    "        if i > 0 and nums[i] == nums[i - 1]:",
    "            continue",
    "        l, r = i + 1, len(nums) - 1",
    "        while l < r:",
    "            total = nums[i] + nums[l] + nums[r]",
    "            if total < 0:",
    "                l += 1",
    "            elif total > 0:",
    "                r -= 1",
    "            else:",
    "                out.append([nums[i], nums[l], nums[r]])",
    "                l += 1",
    "                r -= 1",
    "                while l < r and nums[l] == nums[l - 1]:",
    "                    l += 1",
    "    return out",
  ],
  lines: [0, 1, 2, 3, 4, 6, 7, 8, 10, 12, 13, 14, 15, 17, -1, -1, -1, 19, -1],
};
