import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

const answer = (raw: string) => {
  const steps = trace(mustParse(parseInput, raw));
  return steps[steps.length - 1].state.hasCycle;
};

describe("linked-list-cycle", () => {
  it("matches the worked examples", () => {
    expect(answer("3 2 0 -4 | 1")).toBe(true);
    expect(answer("1 2 | 0")).toBe(true);
    expect(answer("1 2 3 4 | -1")).toBe(false);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("answers correctly on every shape of list", () => {
    const int = seeded(20261035);
    for (let n = 2; n <= 8; n++) {
      for (let pos = -1; pos <= n - 2; pos++) {
        const values = Array.from({ length: n }, () => int(-9, 9));
        const steps = trace({ values, pos });
        expectWellFormed(steps, code);
        expect(steps[steps.length - 1].state.hasCycle).toBe(pos >= 0);
      }
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("1 2 3")).toHaveProperty("error");
    expect(parseInput("1 | 0")).toHaveProperty("error");
    expect(parseInput("1 2 3 | 2")).toHaveProperty("error");
    expect(parseInput("1 2 3 | -2")).toHaveProperty("error");
  });
});
