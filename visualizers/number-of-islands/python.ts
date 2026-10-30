import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def num_islands(grid: list[list[str]]) -> int:",
    "    islands = 0",
    "    for r in range(len(grid)):",
    "        for c in range(len(grid[0])):",
    "            if grid[r][c] != \"1\":",
    "                continue",
    "            islands += 1",
    "            grid[r][c] = \"0\"",
    "            queue = deque([(r, c)])",
    "            while queue:",
    "                cr, cc = queue.popleft()",
    "                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):",
    "                    nr, nc = cr + dr, cc + dc",
    "                    if in_bounds(nr, nc) and grid[nr][nc] == \"1\":",
    "                        grid[nr][nc] = \"0\"",
    "                        queue.append((nr, nc))",
    "    return islands",
  ],
  lines: [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, -1, -1, -1, -1, -1, 16, -1],
};
