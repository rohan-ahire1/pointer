import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { python } from "./python";
import { trace } from "./trace";

/** Brute force: every subarray i..j whose sum is k. */
const runs = (nums: number[], k: number) => {
  const out: [number, number][] = [];
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      if (sum === k) out.push([i, j]);
    }
  }
  return out;
};

const answer = (raw: string) => {
  const steps = trace(mustParse(parseInput, raw));
  return steps[steps.length - 1].state.count;
};

describe("subarray-sum-k", () => {
  it("matches the worked examples", () => {
    expect(answer("3 4 7 2 -3 1 4 2 | 7")).toBe(4);
    expect(answer("1 1 1 | 2")).toBe(2);
    expect(answer("1 2 3 | 3")).toBe(2);
    expect(answer("1 -1 0 | 0")).toBe(3);
  });

  it("every preset is well formed and fits the step budget", () => {
    for (const preset of meta.presets) {
      const steps = trace(mustParse(parseInput, preset));
      expectWellFormed(steps, code, 60);
      for (const step of steps) expect(step.lines.some((line) => python.lines[line] >= 0)).toBe(true);
    }
  });

  it("finds exactly the subarrays brute force finds, on 300 random inputs", () => {
    const int = seeded(20260560);
    for (let n = 0; n < 300; n++) {
      const nums = Array.from({ length: int(1, 10) }, () => int(-9, 9));
      const k = int(-12, 12);
      const steps = trace({ nums, k });
      expectWellFormed(steps, code, 60);
      const want = runs(nums, k);
      expect(steps[steps.length - 1].state.count).toBe(want.length);
      const got = steps.flatMap((step) => step.state.found).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      expect(got).toEqual([...want].sort((a, b) => a[1] - b[1] || a[0] - b[0]));
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("1 2 3")).toHaveProperty("error");
    expect(parseInput("1 2 10 | 3")).toHaveProperty("error");
    expect(parseInput("1 2 | 31")).toHaveProperty("error");
    expect(parseInput("1 2 | 1 2")).toHaveProperty("error");
  });
});
