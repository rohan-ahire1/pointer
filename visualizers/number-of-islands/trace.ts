import type { Step } from "../types";
import type { Cell, IslandsInput, IslandsState } from "./types";

/** Neighbour order straight from the reference solution: down, up, right, left. */
const DIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * Traced Number of Islands (docs/patterns/11-graphs.md): scan row by row;
 * each unclaimed land cell starts a new island, and a queue floods out from
 * it so no island is ever counted twice. Water and claimed cells are skipped
 * silently. Pure and deterministic.
 */
export function trace(input: IslandsInput): Step<IslandsState>[] {
  const rows = input.length;
  const cols = input[0].length;
  const land = input.map((row) => [...row]);
  const owner: (number | null)[][] = land.map((row) => row.map(() => null));
  const queue: Cell[] = [];
  const out: Step<IslandsState>[] = [];
  let islands = 0;

  const push = (
    current: Cell | null,
    scan: Cell | null,
    justAdded: Cell[],
    phase: IslandsState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        land: land.map((row) => [...row]),
        owner: owner.map((row) => [...row]),
        queue: queue.map(([r, c]) => [r, c] as Cell),
        current: current === null ? null : ([...current] as Cell),
        scan: scan === null ? null : ([...scan] as Cell),
        justAdded: justAdded.map(([r, c]) => [r, c] as Cell),
        islands,
        phase,
      },
      lines,
      note,
      sr,
    });
  };

  const landCount = land.flat().filter(Boolean).length;
  const claimedCount = (): number => owner.flat().filter((v) => v !== null).length;
  const queueSr = (): string =>
    queue.length === 0 ? "Queue empty." : `Queue holds ${queue.map(([r, c]) => `(${r}, ${c})`).join(", ")}.`;
  const cellSr = (r: number, c: number): string => `row ${r}, col ${c}`;

  push(
    null,
    [0, 0],
    [],
    "setup",
    [1],
    "Scan the grid row by row. No islands yet.",
    `${rows} ${rows === 1 ? "row" : "rows"}, ${cols} columns, ${landCount} land ${landCount === 1 ? "cell" : "cells"}. Scanning row by row. No islands yet.`,
  );

  // Scan position of the last new island (row-major index); anything between
  // it and the next land is skipped silently, which the note admits to.
  let prevScan = -1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!land[r][c] || owner[r][c] !== null) continue;
      islands++;
      owner[r][c] = islands;
      queue.push([r, c]);
      const skipped = r * cols + c - prevScan - 1;
      prevScan = r * cols + c;
      const prefix = skipped > 0 ? "Scanning… " : "";
      push(
        null,
        [r, c],
        [],
        "new",
        [2, 3, 4, 5, 6, 7],
        `${prefix}New land at row ${r}, col ${c} that nobody has claimed. That’s island ${islands}.`,
        `New land at ${cellSr(r, c)}. That is island ${islands}. ${queueSr()} ${claimedCount()} ${claimedCount() === 1 ? "cell" : "cells"} claimed.`,
      );
      while (queue.length > 0) {
        const [cr, cc] = queue.shift() as Cell;
        const added: Cell[] = [];
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (!land[nr][nc] || owner[nr][nc] !== null) continue;
          owner[nr][nc] = islands;
          queue.push([nr, nc]);
          added.push([nr, nc]);
        }
        const found =
          added.length === 0
            ? `no new neighbours for island ${islands}`
            : added.length === 1
              ? `1 new neighbour joins island ${islands}`
              : `${added.length} new neighbours join island ${islands}`;
        const left =
          queue.length === 0
            ? "Queue: empty."
            : queue.length === 1
              ? "Queue: 1 left."
              : `Queue: ${queue.length} left.`;
        push(
          [cr, cc],
          [r, c],
          added,
          "explore",
          [8, 9, 10, 11, 12, 13, 14],
          `Explore (${cr}, ${cc}): ${found}. ${left}`,
          `Island ${islands}. Exploring ${cellSr(cr, cc)}. ${added.length} new ${added.length === 1 ? "neighbour" : "neighbours"}. ${queueSr()} ${claimedCount()} ${claimedCount() === 1 ? "cell" : "cells"} claimed.`,
        );
      }
    }
  }

  const doneNote =
    islands === 0
      ? "Done. The scan found no islands."
      : `Done. The scan found ${islands} ${islands === 1 ? "island" : "islands"}.`;
  push(
    null,
    null,
    [],
    "done",
    [20],
    doneNote,
    `${doneNote} ${claimedCount()} ${claimedCount() === 1 ? "cell" : "cells"} claimed.`,
  );
  return out;
}
