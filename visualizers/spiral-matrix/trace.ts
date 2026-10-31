import { list } from "../kit/format";
import type { Step } from "../types";
import type { Side, SpiralInput, SpiralState } from "./types";

/** Four walls mark what's unread. Walk the side along a wall, then pull that wall in. */
export function trace(grid: SpiralInput): Step<SpiralState>[] {
  let top = 0;
  let bottom = grid.length - 1;
  let left = 0;
  let right = grid[0].length - 1;
  const read: [number, number][] = [];
  const steps: Step<SpiralState>[] = [];
  const push = (
    current: [number, number] | null,
    side: Side | null,
    phase: SpiralState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { grid, top, bottom, left, right, read: [...read], current, side, phase }, lines, note, sr });
  };
  const visit = (r: number, c: number, side: Side, line: number) => {
    read.push([r, c]);
    push([r, c], side, "read", [line], `Read ${grid[r][c]}, walking along the ${side} wall.`, `Read ${grid[r][c]} at row ${r}, column ${c}.`);
  };
  /** Runs one side's walk, then pulls that wall in. */
  const walk = (side: Side, cells: [number, number][], line: number, pull: () => void) => {
    for (const [r, c] of cells) visit(r, c, side, line);
    pull();
    push(
      null,
      side,
      "wall",
      [line + 1],
      `${cells.length > 0 ? "Side done." : `Nothing left on the ${side}.`} Pull the ${side} wall in.`,
      `${side} wall moved in.`,
    );
  };
  const span = (from: number, to: number) => {
    const out: number[] = [];
    for (let i = from; from <= to ? i <= to : i >= to; i += from <= to ? 1 : -1) out.push(i);
    return out;
  };

  const rows = grid.length;
  const cols = grid[0].length;
  push(null, null, "setup", [2, 3], `A ${rows} by ${cols} grid. Four walls start around the whole thing.`, `${rows} rows and ${cols} columns.`);

  while (top <= bottom && left <= right) {
    const row = top;
    walk("top", span(left, right).map((c) => [row, c]), 5, () => top++);
    const col = right;
    walk("right", top <= bottom ? span(top, bottom).map((r) => [r, col]) : [], 7, () => right--);
    if (top <= bottom) {
      const low = bottom;
      walk("bottom", left <= right ? span(right, left).map((c) => [low, c]) : [], 10, () => bottom--);
    } else {
      push(null, null, "skip", [9], "The top wall passed the bottom wall, so no bottom row is left.", "No bottom row left.");
    }
    if (left <= right) {
      const edge = left;
      walk("left", top <= bottom ? span(bottom, top).map((r) => [r, edge]) : [], 14, () => left++);
    } else {
      push(null, null, "skip", [13], "The left wall passed the right wall, so no left column is left.", "No left column left.");
    }
  }

  const out = read.map(([r, c]) => grid[r][c]);
  push(null, null, "done", [18], `Done. The walls crossed after ${out.length} cells.`, `Done. Order: ${list(out)}.`);
  return steps;
}
