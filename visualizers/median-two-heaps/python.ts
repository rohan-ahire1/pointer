import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "class MedianFinder:",
    "    def __init__(self):",
    "        self.low = []   # smaller half, negated to act as a max-heap",
    "        self.high = []  # larger half",
    "",
    "    def add_num(self, num: int) -> None:",
    "        heappush(self.low, -num)",
    "        heappush(self.high, -heappop(self.low))",
    "        if len(self.high) > len(self.low):",
    "            heappush(self.low, -heappop(self.high))",
    "",
    "    def find_median(self) -> float:",
    "        if len(self.low) > len(self.high):",
    "            return -self.low[0]",
    "        return (-self.low[0] + self.high[0]) / 2",
  ],
  lines: [0, 2, 3, 4, 5, 6, 7, 8, 9, -1, -1, 10, 11, 12, 14, -1, -1],
};
