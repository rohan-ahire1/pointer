import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { CourseInput } from "./types";

/** A graph can be finished exactly when depth-first search never meets a node still on its path. */
function hasCycle({ n, edges }: CourseInput): boolean {
  const state = Array.from({ length: n }, () => 0);
  const visit = (node: number): boolean => {
    if (state[node] === 1) return true;
    if (state[node] === 2) return false;
    state[node] = 1;
    const found = edges.some(([before, after]) => before === node && visit(after));
    state[node] = 2;
    return found;
  };
  return Array.from({ length: n }, (_, node) => visit(node)).some(Boolean);
}

describe("course-schedule", () => {
  it("matches the worked examples", () => {
    const answer = (raw: string) => {
      const steps = trace(mustParse(parseInput, raw));
      return steps[steps.length - 1].state.canFinish;
    };
    expect(answer("4 | 0>1 0>2 1>3 2>3")).toBe(true);
    expect(answer("2 | 0>1 1>0")).toBe(false);
    expect(answer("3 |")).toBe(true);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches cycle detection on 300 random graphs, with a valid order", () => {
    const int = seeded(20261039);
    for (let k = 0; k < 300; k++) {
      const n = int(2, 6);
      const links = new Map<string, [number, number]>();
      for (let e = int(0, 9); e > 0; e--) {
        const before = int(0, n - 1);
        const after = int(0, n - 1);
        if (before !== after) links.set(`${before}>${after}`, [before, after]);
      }
      const input = { n, edges: [...links.values()] };
      const steps = trace(input);
      expectWellFormed(steps, code);
      const last = steps[steps.length - 1].state;
      expect(last.canFinish).toBe(!hasCycle(input));
      if (last.canFinish) {
        for (const [before, after] of input.edges) {
          expect(last.taken.indexOf(before)).toBeLessThan(last.taken.indexOf(after));
        }
      }
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("3")).toHaveProperty("error");
    expect(parseInput("9 | 0>1")).toHaveProperty("error");
    expect(parseInput("3 | 0-1")).toHaveProperty("error");
    expect(parseInput("3 | 0>5")).toHaveProperty("error");
    expect(parseInput("3 | 1>1")).toHaveProperty("error");
    expect(parseInput("3 | 0>1 0>1")).toHaveProperty("error");
  });
});
