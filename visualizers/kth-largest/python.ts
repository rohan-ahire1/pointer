import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "from heapq import heappop, heappush",
    "",
    "def find_kth_largest(nums: list[int], k: int) -> int:",
    "    heap = []",
    "    for n in nums:",
    "        heappush(heap, n)",
    "        if len(heap) > k:",
    "            heappop(heap)",
    "    return heap[0]",
  ],
  lines: [2, 3, 4, 5, 7, -1, 8, -1],
};
