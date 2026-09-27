import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { TwoSumInput } from "./types";

/** mulberry32: a tiny seeded PRNG (no dependency) for the property tests. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Independent brute force: the first pair a double loop finds, if any. */
function bruteForce(nums: number[], target: number): [number, number] | null {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return null;
}

function mustParse(raw: string): TwoSumInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("two-sum presets", () => {
  it.each([
    ["2 7 11 15 | 9", [0, 1], 6],
    ["3 2 4 | 6", [1, 2], 8],
    ["3 3 | 6", [0, 1], 6],
  ])("%s -> answer %j over %i steps", (preset, expectedAnswer, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps[steps.length - 1].state.answer).toEqual(expectedAnswer);
  });

  it("reports no pair when nothing adds to the target", () => {
    const steps = trace(mustParse("1 2 3 | 100"));
    expect(steps[steps.length - 1].state.answer).toBeNull();
    expect(steps[steps.length - 1].note).toBe("Done. No two numbers add up to 100.");
  });
});

describe("two-sum trace shape", () => {
  const inputs = [...meta.presets, "1 2 3 | 100", "-5 5 0 | 0"];

  it("is deterministic", () => {
    for (const preset of inputs) {
      expect(trace(mustParse(preset))).toEqual(trace(mustParse(preset)));
    }
  });

  it("every step's lines are valid indices into code", () => {
    for (const preset of inputs) {
      for (const step of trace(mustParse(preset))) {
        expect(step.lines.length).toBeGreaterThan(0);
        for (const line of step.lines) {
          expect(line, `line ${line} for "${preset}"`).toBeGreaterThanOrEqual(0);
          expect(line, `line ${line} for "${preset}"`).toBeLessThan(code.length);
        }
      }
    }
  });

  it("every note is non-empty and at most 110 chars, every sr is non-empty", () => {
    for (const preset of inputs) {
      for (const step of trace(mustParse(preset))) {
        expect(step.note.length, `note for "${preset}"`).toBeGreaterThan(0);
        expect(step.note.length, `note "${step.note}"`).toBeLessThanOrEqual(110);
        expect(step.sr.length, `sr for "${preset}"`).toBeGreaterThan(0);
      }
    }
  });

  it("first step is setup, last step starts with Done.", () => {
    for (const preset of inputs) {
      const steps = trace(mustParse(preset));
      expect(steps[0].state.phase).toBe("setup");
      expect(steps[0].state.i).toBe(-1);
      expect(steps[0].state.map).toEqual([]);
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("re-setting a value updates its index in place, like a JS Map", () => {
    // 5, 5, 1 with target 6: i=1 misses (need 1), overwriting 5's index to 1.
    const miss = trace(mustParse("5 5 1 | 6"))[4];
    expect(miss.state.phase).toBe("miss");
    expect(miss.state.map).toEqual([{ value: 5, index: 1 }]);
  });
});

describe("two-sum property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20260101);
    const int = (min: number, max: number): number =>
      min + Math.floor(rand() * (max - min + 1));
    for (let k = 0; k < 300; k++) {
      const len = int(2, 8);
      const nums = Array.from({ length: len }, () => int(-99, 99));
      const target = int(-198, 198);
      const steps = trace({ nums, target });
      expect(steps.length, `steps for ${JSON.stringify({ nums, target })}`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      const expected = bruteForce(nums, target);
      const answer = steps[steps.length - 1].state.answer;
      if (expected === null) {
        expect(answer).toBeNull();
      } else {
        expect(answer).not.toBeNull();
        const [j, i] = answer as [number, number];
        expect(j).not.toBe(i);
        expect(nums[j] + nums[i]).toBe(target);
      }
    }
  });
});

describe("two-sum parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("2 7 11 15 | 9")).toEqual({ nums: [2, 7, 11, 15], target: 9 });
    expect(parseInput("3 2 4 | 6")).toEqual({ nums: [3, 2, 4], target: 6 });
    expect(parseInput("3 3 | 6")).toEqual({ nums: [3, 3], target: 6 });
  });

  it("accepts commas and extra spacing", () => {
    expect(parseInput("2,7,11,15|9")).toEqual({ nums: [2, 7, 11, 15], target: 9 });
    expect(parseInput("  3   3  |  6 ")).toEqual({ nums: [3, 3], target: 6 });
  });

  it.each([
    ["", "Enter 2–8 whole numbers"],
    ["2 7 11 15", "one | between"],
    ["2 7 | 9 | 10", "one | between"],
    ["| 9", "before the |"],
    ["2 | 9", "2–8 numbers"],
    ["1 2 3 4 5 6 7 8 9 | 9", "2–8 numbers"],
    ["2 x 3 | 9", "whole number"],
    ["2.5 3 | 9", "whole number"],
    ["100 3 | 9", "-99 to 99"],
    ["2 3 |", "after the |"],
    ["2 3 | 9 10", "one whole number"],
    ["2 3 | foo", "one whole number"],
    ["2 3 | 199", "-198 to 198"],
    ["2 3 | -199", "-198 to 198"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
