/** The solution shown in the code panel. Line numbers here are what Step["lines"] refers to. */
export const code: string[] = [
  "function orangesRotting(grid: number[][]): number {", // 0
  "  const queue: [number, number][] = [];", // 1
  "  let fresh = 0;", // 2
  "  for (let r = 0; r < grid.length; r++) {", // 3
  "    for (let c = 0; c < grid[0].length; c++) {", // 4
  "      if (grid[r][c] === 2) queue.push([r, c]);", // 5
  "      else if (grid[r][c] === 1) fresh++;", // 6
  "    }", // 7
  "  }", // 8
  "  let minutes = 0;", // 9
  "  let head = 0;", // 10
  "  while (fresh > 0 && head < queue.length) {", // 11
  "    // Everything in the queue now rots its neighbours this minute.", // 12
  "    const end = queue.length;", // 13
  "    for (; head < end; head++) {", // 14
  "      const [r, c] = queue[head];", // 15
  "      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {", // 16
  "        const nr = r + dr, nc = c + dc;", // 17
  "        if (grid[nr]?.[nc] !== 1) continue;", // 18
  "        grid[nr][nc] = 2;", // 19
  "        fresh--;", // 20
  "        queue.push([nr, nc]);", // 21
  "      }", // 22
  "    }", // 23
  "    minutes++;", // 24
  "  }", // 25
  "  return fresh === 0 ? minutes : -1;", // 26
  "}", // 27
];
