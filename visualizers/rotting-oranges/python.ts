import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "from collections import deque",
    "",
    "def oranges_rotting(grid: list[list[int]]) -> int:",
    "    rows, cols = len(grid), len(grid[0])",
    "    queue = deque()",
    "    fresh = 0",
    "    for r in range(rows):",
    "        for c in range(cols):",
    "            if grid[r][c] == 2:",
    "                queue.append((r, c))",
    "            elif grid[r][c] == 1:",
    "                fresh += 1",
    "    minutes = 0",
    "    while fresh > 0 and queue:",
    "        # Everything in the queue now rots its neighbours this minute.",
    "        for _ in range(len(queue)):",
    "            r, c = queue.popleft()",
    "            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):",
    "                nr, nc = r + dr, c + dc",
    "                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:",
    "                    grid[nr][nc] = 2",
    "                    fresh -= 1",
    "                    queue.append((nr, nc))",
    "        minutes += 1",
    "    return minutes if fresh == 0 else -1",
  ],
  lines: [2, 4, 5, 6, 7, 9, 11, -1, -1, 12, -1, 13, 14, 15, 15, 16, 17, 18, 19, 20, 21, 22, -1, -1, 23, -1, 24, -1],
};
