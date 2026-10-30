import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def find_kth_largest(nums: list[int], k: int) -> int:",
    "    heap = []",
    "    for n in nums:",
    "        heappush(heap, n)",
    "        if len(heap) > k:",
    "            heappop(heap)",
    "    return heap[0]",
  ],
  lines: [0, 1, 2, 3, 5, -1, 6, -1],
};
