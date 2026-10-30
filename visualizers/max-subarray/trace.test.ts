import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

function bruteForce(nums: number[]): number {
  let best = -Infinity;
  for (let a = 0; a < nums.length; a++) {
    let sum = 0;
    for (let b = a; b < nums.length; b++) {
      sum += nums[b];
      best = Math.max(best, sum);
    }
  }
  return best;
}

describe("max-subarray", () => {
  it("matches the worked examples", () => {
    const answer = (raw: string) => {
      const steps = trace(mustParse(parseInput, raw));
      return steps[steps.length - 1].state.best;
    };
    expect(answer("-2 1 -3 4 -1 2 1 -5 4")).toBe(6);
    expect(answer("-3 -1 -2")).toBe(-1);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches brute force on 300 random inputs, and the range adds up", () => {
    const int = seeded(20261041);
    for (let k = 0; k < 300; k++) {
      const nums = Array.from({ length: int(1, 10) }, () => int(-20, 20));
      const steps = trace(nums);
      expectWellFormed(steps, code);
      const { best, bestRange } = steps[steps.length - 1].state;
      expect(best).toBe(bruteForce(nums));
      const total = nums.slice(bestRange!.start, bestRange!.end + 1).reduce((a, b) => a + b, 0);
      expect(total).toBe(best);
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("")).toHaveProperty("error");
    expect(parseInput("1 x")).toHaveProperty("error");
    expect(parseInput("100")).toHaveProperty("error");
  });
});
