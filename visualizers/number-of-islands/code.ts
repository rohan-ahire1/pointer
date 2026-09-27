/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/11-graphs.md.
 */
export const code: string[] = [
  "function numIslands(grid: string[][]): number {", // 0
  "  let islands = 0;", // 1
  "  for (let r = 0; r < grid.length; r++) {", // 2
  "    for (let c = 0; c < grid[0].length; c++) {", // 3
  "      if (grid[r][c] !== \"1\") continue;", // 4
  "      islands++;", // 5
  "      grid[r][c] = \"0\";", // 6
  "      const queue: [number, number][] = [[r, c]];", // 7
  "      while (queue.length > 0) {", // 8
  "        const [cr, cc] = queue.shift()!;", // 9
  "        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {", // 10
  "          const nr = cr + dr, nc = cc + dc;", // 11
  "          if (grid[nr]?.[nc] === \"1\") {", // 12
  "            grid[nr][nc] = \"0\";", // 13
  "            queue.push([nr, nc]);", // 14
  "          }", // 15
  "        }", // 16
  "      }", // 17
  "    }", // 18
  "  }", // 19
  "  return islands;", // 20
  "}", // 21
];
