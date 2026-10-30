import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def exist(board: list[list[str]], word: str) -> bool:",
    "    def dfs(r: int, c: int, i: int) -> bool:",
    "        if i == len(word):",
    "            return True",
    "        if not in_bounds(r, c) or board[r][c] != word[i]:",
    "            return False",
    "        saved = board[r][c]",
    "        board[r][c] = \"#\"",
    "        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1)",
    "                 or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))",
    "        board[r][c] = saved",
    "        return found",
    "    for r in range(len(board)):",
    "        for c in range(len(board[0])):",
    "            if dfs(r, c, 0):",
    "                return True",
    "    return False",
  ],
  lines: [0, 1, 2, 4, 6, 7, 8, 9, 10, 11, -1, 12, 13, 14, -1, -1, 16, -1],
};
