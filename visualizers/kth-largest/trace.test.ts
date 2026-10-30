import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

const answer = (raw: string) => {
  const steps = trace(mustParse(parseInput, raw));
  return steps[steps.length - 1].state.heap[0].value;
};

describe("kth-largest", () => {
  it("matches the worked examples", () => {
    expect(answer("3 2 1 5 6 4 | 2")).toBe(5);
    expect(answer("3 2 3 1 2 4 5 5 | 4")).toBe(3);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches sorting on 300 random inputs", () => {
    const int = seeded(20261037);
    for (let n = 0; n < 300; n++) {
      const nums = Array.from({ length: int(1, 8) }, () => int(-9, 9));
      const k = int(1, nums.length);
      const steps = trace({ nums, k });
      expectWellFormed(steps, code);
      const sorted = [...nums].sort((a, b) => b - a);
      const last = steps[steps.length - 1].state;
      expect(last.heap[0].value).toBe(sorted[k - 1]);
      expect(last.heap).toHaveLength(k);
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("1 2 3")).toHaveProperty("error");
    expect(parseInput("1 2 | 3")).toHaveProperty("error");
    expect(parseInput("1 2 | 0")).toHaveProperty("error");
  });
});
