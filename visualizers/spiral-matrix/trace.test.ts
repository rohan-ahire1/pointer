import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { SpiralInput } from "./types";

/** Walks and turns when blocked, with a seen grid: the other way to read a spiral. */
function walkWithSeen(grid: SpiralInput): number[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = grid.map((row) => row.map(() => false));
  const turns = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const out: number[] = [];
  let [r, c, turn] = [0, 0, 0];
  for (let count = 0; count < rows * cols; count++) {
    out.push(grid[r][c]);
    seen[r][c] = true;
    const [nextR, nextC] = [r + turns[turn][0], c + turns[turn][1]];
    if (nextR < 0 || nextR >= rows || nextC < 0 || nextC >= cols || seen[nextR][nextC]) turn = (turn + 1) % 4;
    r += turns[turn][0];
    c += turns[turn][1];
  }
  return out;
}

describe("spiral-matrix", () => {
  const order = (grid: SpiralInput) => {
    const steps = trace(grid);
    return steps[steps.length - 1].state.read.map(([r, c]) => grid[r][c]);
  };

  it("matches the worked examples", () => {
    expect(order(mustParse(parseInput, "1 2 3 4 | 5 6 7 8 | 9 10 11 12"))).toEqual([1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]);
    expect(order(mustParse(parseInput, "1 2 3 | 4 5 6 | 7 8 9"))).toEqual([1, 2, 3, 6, 9, 8, 7, 4, 5]);
    expect(order(mustParse(parseInput, "1 2 3"))).toEqual([1, 2, 3]);
    expect(order(mustParse(parseInput, "1 | 2 | 3"))).toEqual([1, 2, 3]);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches the seen-grid walk on every shape up to 5 by 5, reading each cell once", () => {
    const int = seeded(20261033);
    for (let rows = 1; rows <= 5; rows++) {
      for (let cols = 1; cols <= 5; cols++) {
        const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => int(0, 99)));
        const steps = trace(grid);
        expect(order(grid)).toEqual(walkWithSeen(grid));
        const read = steps[steps.length - 1].state.read;
        expect(new Set(read.map(String)).size).toBe(rows * cols);
        expectWellFormed(steps, code);
      }
    }
  });

  it("takes a pasted LeetCode grid", () => {
    expect(mustParse(parseInput, "[[1,2],[3,4]]")).toEqual([[1, 2], [3, 4]]);
  });

  it("explains what's wrong with bad input", () => {
    expect(parseInput("")).toHaveProperty("error");
    expect(parseInput("1 2 | 3")).toHaveProperty("error");
    expect(parseInput("1 2 3 4 5 6")).toHaveProperty("error");
    expect(parseInput("1 | 2 | 3 | 4 | 5 | 6")).toHaveProperty("error");
    expect(parseInput("100 2")).toHaveProperty("error");
    expect(parseInput("a b")).toHaveProperty("error");
  });
});
