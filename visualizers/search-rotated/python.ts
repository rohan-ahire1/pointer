import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def search(nums: list[int], target: int) -> int:",
    "    lo, hi = 0, len(nums) - 1",
    "    while lo <= hi:",
    "        mid = (lo + hi) // 2",
    "        if nums[mid] == target:",
    "            return mid",
    "        if nums[lo] <= nums[mid]:  # left half is in order",
    "            if nums[lo] <= target < nums[mid]:",
    "                hi = mid - 1",
    "            else:",
    "                lo = mid + 1",
    "        else:  # right half is in order",
    "            if nums[mid] < target <= nums[hi]:",
    "                lo = mid + 1",
    "            else:",
    "                hi = mid - 1",
    "    return -1",
  ],
  lines: [0, 1, 2, 3, 4, 6, 8, 10, 11, 13, 15, -1, -1, 16, -1],
};
