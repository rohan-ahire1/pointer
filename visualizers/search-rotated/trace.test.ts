import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

const answer = (raw: string) => {
  const steps = trace(mustParse(parseInput, raw));
  return steps[steps.length - 1].state.answer;
};

describe("search-rotated", () => {
  it("matches the worked examples", () => {
    expect(answer("4 5 6 7 0 1 2 | 0")).toBe(4);
    expect(answer("4 5 6 7 0 1 2 | 3")).toBe(-1);
    expect(answer("1 | 0")).toBe(-1);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches indexOf on 300 random rotations", () => {
    const int = seeded(20261034);
    for (let k = 0; k < 300; k++) {
      const sorted = [...new Set(Array.from({ length: int(1, 10) }, () => int(-20, 20)))].sort((a, b) => a - b);
      const cut = int(0, sorted.length - 1);
      const nums = [...sorted.slice(cut), ...sorted.slice(0, cut)];
      const target = int(-20, 20);
      const steps = trace({ nums, target });
      expectWellFormed(steps, code);
      expect(steps[steps.length - 1].state.answer).toBe(nums.indexOf(target));
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("1 2 3")).toHaveProperty("error");
    expect(parseInput("1 1 2 | 1")).toHaveProperty("error");
    expect(parseInput("3 1 4 2 | 1")).toHaveProperty("error");
    expect(parseInput("1 2 | 1 2")).toHaveProperty("error");
  });
});
