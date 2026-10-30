import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

function bruteForce(nums: number[]): string[] {
  const out = new Set<string>();
  for (let a = 0; a < nums.length; a++) {
    for (let b = a + 1; b < nums.length; b++) {
      for (let c = b + 1; c < nums.length; c++) {
        if (nums[a] + nums[b] + nums[c] === 0) {
          out.add([nums[a], nums[b], nums[c]].sort((x, y) => x - y).join(","));
        }
      }
    }
  }
  return [...out].sort();
}

const answer = (nums: number[]) => {
  const steps = trace(nums);
  return steps[steps.length - 1].state.found.map((t) => t.join(",")).sort();
};

describe("three-sum", () => {
  it("matches the worked example", () => {
    expect(answer(mustParse(parseInput, "-1 0 1 2 -1 -4"))).toEqual(["-1,-1,2", "-1,0,1"]);
  });

  it("gives one answer for repeated zeros", () => {
    expect(answer(mustParse(parseInput, "0 0 0 0"))).toEqual(["0,0,0"]);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches brute force on 300 random inputs", () => {
    const int = seeded(20261031);
    for (let k = 0; k < 300; k++) {
      const nums = Array.from({ length: int(3, 8) }, () => int(-6, 6));
      expectWellFormed(trace(nums), code);
      expect(answer(nums)).toEqual(bruteForce(nums));
    }
  });

  it("does not change the input it was given", () => {
    const nums = [3, 1, 2];
    trace(nums);
    expect(nums).toEqual([3, 1, 2]);
  });

  it("rejects bad input", () => {
    expect(parseInput("1 2")).toHaveProperty("error");
    expect(parseInput("1 2 z")).toHaveProperty("error");
  });
});
