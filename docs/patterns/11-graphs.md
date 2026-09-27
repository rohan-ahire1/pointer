# 11 · Graphs — Number of Islands (BFS)

- **Visualizer id:** `number-of-islands` · **Folder:** `visualizers/number-of-islands/`
- **Title:** "Number of Islands"
- **Story:** scan for land you haven't seen. Each time you find some, that's a new island. Flood out from it with a queue so you never count it twice.

## Input
- `inputLabel`: `grid =` · `inputMaxLength`: 41
- `inputHint`: `1–5 rows of 1s (land) and 0s (water), up to 6 wide, rows separated by spaces.`
- All rows must be the same length; the error says so.
- Presets and expected answers:
  - `11000 11000 00100 00011` → `3`
  - `11110 11010 11000 00000` → `1`
  - `101 010 101` → `5`

## Reference solution
```ts
function numIslands(grid: string[][]): number {
  let islands = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] !== "1") continue;
      islands++;
      grid[r][c] = "0";
      const queue: [number, number][] = [[r, c]];
      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = cr + dr, nc = cc + dc;
          if (grid[nr]?.[nc] === "1") {
            grid[nr][nc] = "0";
            queue.push([nr, nc]);
          }
        }
      }
    }
  }
  return islands;
}
```

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 1 | Scan the grid row by row. No islands yet. |
| new island | 2, 3, 4, 5, 6, 7 | New land at row 2, col 2 that nobody has claimed. That’s island 2. |
| explore | 8, 9, 10, 11, 12, 13, 14 | Explore (0, 1): 1 new neighbour joins island 1. Queue: 1 left. |
| done | 20 | Done. The scan found 3 islands. |

Water and already-claimed cells are skipped silently: the scan cursor jumps to the next unclaimed land, and the `new island` note can say
`Scanning… ` first. One `explore` step per dequeued cell, which also enqueues its new neighbours.
`sr` example: `Island 1. Exploring row 0, col 1. Queue holds row 1, col 1. 3 of 4 land cells in this island claimed.`
State: `{ grid: ("water" | "land")[][], owner: (number | null)[][], scan: [r, c] | null, current: [r, c] | null, queue: [r, c][], islands: number, justAdded: [r, c][] }`.

## View
- **Grid** of cells (`--cell` 48px, shrinking on phones; 6 columns must fit at 320px). No gaps bigger than 4px.
  - Water: `--sky` fill with a `≈` glyph in `--on-accent`.
  - Unclaimed land: `--card`, solid border, with a small `▲`.
  - Queued: `range` (`--tint-yellow`) with `…`.
  - Current (being explored): orange, lifted.
  - Claimed: `--tint-mint` with the island number in the display font (`1`, `2`, …). Cells of the same island also share a thicker outline, so islands read as shapes.
- A `scan` tag (inverse) sits on the scan cursor's cell. Just-added neighbours pulse once (scale 1 → 1.08 → 1 over `--dur-base`).
- **Queue panel** under the grid: chips `(1, 1)` in order. The front leaves from the left and new ones enter on the right.
- **Stats:** `queue` (length) · `claimed` · answer tile `islands`.

## Tests: brute force
Recursive DFS flood fill counting components. The generator makes random grids within the limits.

## Content direction
- Analogy seed: spilling ink on a map. Drop it on any land you haven't coloured, and it spreads to every square joined to it. Count the drops.
- `needs`: 2D arrays, queues. `complexity`: `O(m·n)`.
- Problems: number-of-islands (visualized), clone-graph, pacific-atlantic-water-flow, course-schedule, number-of-connected-components, graph-valid-tree.
