import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

function bruteForce(nums: number[]): number[] {
  return nums.map((_, i) => nums.reduce((product, n, j) => (j === i ? product : product * n), 1) + 0);
}

describe("product-except-self", () => {
  it("matches the worked example", () => {
    const steps = trace(mustParse(parseInput, "1 2 3 4"));
    expect(steps[steps.length - 1].state.out).toEqual([24, 12, 8, 6]);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches brute force on 300 random inputs", () => {
    const int = seeded(20261030);
    for (let k = 0; k < 300; k++) {
      const nums = Array.from({ length: int(2, 7) }, () => int(-9, 9));
      const steps = trace(nums);
      expectWellFormed(steps, code);
      expect(steps[steps.length - 1].state.out).toEqual(bruteForce(nums));
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("5")).toHaveProperty("error");
    expect(parseInput("1 2 x")).toHaveProperty("error");
    expect(parseInput("10 2")).toHaveProperty("error");
  });
});
