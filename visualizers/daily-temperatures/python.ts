import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def daily_temperatures(temps: list[int]) -> list[int]:",
    "    out = [0] * len(temps)",
    "    stack = []  # days still waiting",
    "    for i, t in enumerate(temps):",
    "        while stack and t > temps[stack[-1]]:",
    "            day = stack.pop()",
    "            out[day] = i - day",
    "        stack.append(i)",
    "    return out",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, -1, 7, -1, 8, -1],
};
