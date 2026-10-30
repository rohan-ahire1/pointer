import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def combination_sum(candidates: list[int], target: int) -> list[list[int]]:",
    "    result = []",
    "    path = []",
    "    candidates.sort()",
    "    def dfs(start: int, remaining: int) -> None:",
    "        if remaining == 0:",
    "            result.append(path[:])",
    "            return",
    "        for i in range(start, len(candidates)):",
    "            if candidates[i] > remaining:",
    "                break",
    "            path.append(candidates[i])",
    "            dfs(i, remaining - candidates[i])",
    "            path.pop()",
    "    dfs(0, target)",
    "    return result",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, 7, -1, 8, 9, 11, 12, 13, -1, -1, 14, 15, -1],
};
