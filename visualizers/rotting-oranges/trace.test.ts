import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";

/** Brute force: rot in whole-grid rounds, and record when each orange went bad. */
const rounds = (grid: number[][]) => {
  const g = grid.map((row) => [...row]);
  const when = g.map((row) => row.map((v) => (v === 2 ? 0 : null as number | null)));
  for (let minute = 1; ; minute++) {
    const next: [number, number][] = [];
    g.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v !== 1) return;
        const near = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]].some(([a, b]) => g[a]?.[b] === 2);
        if (near) next.push([r, c]);
      }),
    );
    if (next.length === 0) {
      const fresh = g.flat().filter((v) => v === 1).length;
      return { answer: fresh ? -1 : minute - 1, when };
    }
    for (const [r, c] of next) {
      g[r][c] = 2;
      when[r][c] = minute;
    }
  }
};

const last = (raw: string) => {
  const steps = trace(mustParse(parseInput, raw));
  return steps[steps.length - 1].state;
};

describe("rotting-oranges", () => {
  it("matches the worked examples", () => {
    expect(last("21100 11011 01110 00112").answer).toBe(4);
    expect(last("211 110 011").answer).toBe(4);
    expect(last("211 011 101").answer).toBe(-1);
    expect(last("02").answer).toBe(0);
    expect(last("[[2,1,1],[1,1,0],[0,1,1]]").answer).toBe(4);
  });

  it("every preset is well formed and every step maps to Python", () => {
    for (const preset of meta.presets) {
      const steps = trace(mustParse(parseInput, preset));
      expectWellFormed(steps, code, 60);
      for (const step of steps) expect(step.lines.some((line) => python.lines[line] >= 0)).toBe(true);
    }
  });

  it("agrees with whole-grid rounds on 400 random grids", () => {
    const int = seeded(20260994);
    for (let n = 0; n < 400; n++) {
      const rows = int(1, 5);
      const cols = int(1, 6);
      const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => [0, 1, 1, 1, 2][int(0, 4)]));
      const steps = trace(grid);
      expectWellFormed(steps, code, 60);
      const want = rounds(grid);
      const end = steps[steps.length - 1].state;
      expect(end.answer).toBe(want.answer);
      if (want.answer >= 0) expect(end.rotAt).toEqual(want.when);
      // a minute only ends once everything queued for it has spread
      for (const step of steps) if (step.state.phase === "tick") expect(step.state.front).toBe(0);
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("")).toHaveProperty("error");
    expect(parseInput("213")).toHaveProperty("error");
    expect(parseInput("21 1")).toHaveProperty("error");
    expect(parseInput("1234567")).toHaveProperty("error");
    expect(parseInput("1 1 1 1 1 1")).toHaveProperty("error");
  });
});
