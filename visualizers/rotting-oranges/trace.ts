import type { Step } from "../types";
import type { Cell, OrangesInput, OrangesState } from "./types";

/** Neighbour order straight from the reference solution: down, up, right, left. */
const DIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const at = ([r, c]: Cell) => `(${r}, ${c})`;

/**
 * Traced Rotting Oranges: every rotten orange starts in the queue, and each pass
 * of the outer loop is one minute in which the whole queue rots its fresh
 * neighbours. One step per orange that spreads, one per minute that ends.
 */
export function trace(input: OrangesInput): Step<OrangesState>[] {
  const rows = input.length;
  const cols = input[0].length;
  const grid = input.map((row) => [...row]);
  const rotAt: (number | null)[][] = grid.map((row) => row.map((v) => (v === 2 ? 0 : null)));
  const queue: Cell[] = [];
  const out: Step<OrangesState>[] = [];
  let fresh = 0;
  let minutes = 0;
  let head = 0;
  let end = 0;

  const push = (current: Cell | null, justRotted: Cell[], answer: number | null, phase: OrangesState["phase"], lines: number[], note: string, sr: string) => {
    out.push({
      state: {
        grid: grid.map((row) => [...row]),
        rotAt: rotAt.map((row) => [...row]),
        queue: queue.slice(head).map(([r, c]) => [r, c] as Cell),
        front: Math.max(0, end - head),
        current: current && ([...current] as Cell),
        justRotted: justRotted.map(([r, c]) => [r, c] as Cell),
        fresh,
        minutes,
        answer,
        phase,
      },
      lines,
      note,
      sr,
    });
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }
  push(
    null, [], null, "setup", [1, 2, 3, 4, 5, 6, 9, 10],
    fresh === 0
      ? `No fresh oranges, so nothing has to rot. ${plural(queue.length, "rotten one")} in the queue.`
      : `${plural(queue.length, "rotten orange")} ${queue.length === 1 ? "starts" : "start"} in the queue. ${plural(fresh, "fresh one")} still to rot.`,
    `${rows} by ${cols} grid. ${queue.length} rotten in the queue, ${fresh} fresh.`,
  );

  while (fresh > 0 && head < queue.length) {
    end = queue.length;
    let rottedThisMinute = 0;
    for (; head < end; ) {
      const cell = queue[head];
      const [r, c] = cell;
      const rotted: Cell[] = [];
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 2;
        rotAt[nr][nc] = minutes + 1;
        fresh--;
        queue.push([nr, nc]);
        rotted.push([nr, nc]);
      }
      rottedThisMinute += rotted.length;
      head++;
      push(
        cell, rotted, null, "spread", rotted.length ? [14, 15, 16, 17, 18, 19, 20, 21] : [14, 15, 16, 17, 18],
        rotted.length
          ? `Minute ${minutes + 1}: ${at(cell)} rots ${rotted.map(at).join(" and ")}. ${fresh} fresh left.`
          : `Minute ${minutes + 1}: ${at(cell)} has no fresh neighbours.`,
        `Minute ${minutes + 1}. ${at(cell)} rotted ${rotted.length}. ${fresh} fresh left. ${queue.length - head} in the queue.`,
      );
    }
    minutes++;
    push(
      null, [], null, "tick", [24, 11],
      rottedThisMinute
        ? `Minute ${minutes} is over: ${plural(rottedThisMinute, "orange")} went bad. ${fresh} fresh left.`
        : `Minute ${minutes} is over, but nothing rotted, and the queue is empty.`,
      `${minutes} minutes so far. ${fresh} fresh left. ${queue.length - head} queued for the next minute.`,
    );
  }

  const answer = fresh === 0 ? minutes : -1;
  push(
    null, [], answer, "done", [26],
    fresh === 0
      ? `Done. Every orange is rotten after ${plural(minutes, "minute")}.`
      : `Done. ${plural(fresh, "fresh orange")} can never be reached, so the answer is -1.`,
    `Done. The answer is ${answer}.`,
  );
  return out;
}
