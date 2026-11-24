import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { RotateInput } from "./types";

/** Builds a new grid instead of swapping in place: the other way to turn it clockwise. */
function rotated(grid: RotateInput): RotateInput {
  const n = grid.length;
  return grid.map((row, r) => row.map((_, c) => grid[n - 1 - c][r]));
}

describe("rotate-image", () => {
  const final = (grid: RotateInput) => {
    const steps = trace(grid);
    return steps[steps.length - 1].state.matrix;
  };

  it("matches the worked examples", () => {
    expect(final(mustParse(parseInput, "1 2 3 | 4 5 6 | 7 8 9"))).toEqual([[7, 4, 1], [8, 5, 2], [9, 6, 3]]);
    expect(final(mustParse(parseInput, "1 2 | 3 4"))).toEqual([[3, 1], [4, 2]]);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches a plain rotation on seeded random grids, and leaves the input alone", () => {
    const int = seeded(20261048);
    for (let count = 0; count < 200; count++) {
      const n = int(2, 5);
      const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => int(0, 99)));
      const copy = grid.map((row) => [...row]);
      const steps = trace(grid);
      expect(steps[steps.length - 1].state.matrix).toEqual(rotated(grid));
      expect(grid).toEqual(copy);
      expectWellFormed(steps, code);
    }
  });

  it("transposes first, then reverses rows", () => {
    const steps = trace(mustParse(parseInput, "1 2 3 | 4 5 6 | 7 8 9"));
    const phases = steps.map((step) => step.state.phase);
    expect(phases.indexOf("flip")).toBeGreaterThan(phases.lastIndexOf("transpose"));
    const afterTranspose = steps[phases.lastIndexOf("transpose")].state.matrix;
    expect(afterTranspose).toEqual([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
    expect(steps[1].state.pair).toEqual([[0, 1], [1, 0]]);
  });

  it("takes a pasted LeetCode grid", () => {
    expect(mustParse(parseInput, "[[1,2,3],[4,5,6],[7,8,9]]")).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    expect(mustParse(parseInput, "[[1,2],[3,4]]")).toEqual([[1, 2], [3, 4]]);
  });

  it("explains what's wrong with bad input", () => {
    expect(parseInput("")).toHaveProperty("error");
    expect(parseInput("1 2 | 3")).toMatchObject({ error: expect.stringContaining("same length") });
    expect(parseInput("1 2 3 | 4 5 6")).toMatchObject({ error: expect.stringContaining("square") });
    expect(parseInput("1 2 | 3 4 | 5 6")).toMatchObject({ error: expect.stringContaining("square") });
    expect(parseInput("1 2 3")).toMatchObject({ error: expect.stringContaining("square") });
    expect(parseInput("5")).toMatchObject({ error: expect.stringContaining("2×2") });
    expect(parseInput("1 2 3 4 5 6 | 1 2 3 4 5 6 | 1 2 3 4 5 6 | 1 2 3 4 5 6 | 1 2 3 4 5 6 | 1 2 3 4 5 6")).toMatchObject({
      error: expect.stringContaining("5×5"),
    });
    expect(parseInput("100 2 | 3 4")).toMatchObject({ error: expect.stringContaining("0 to 99") });
    expect(parseInput("a b | c d")).toHaveProperty("error");
    expect(parseInput("1 -2 | 3 4")).toHaveProperty("error");
  });
});
