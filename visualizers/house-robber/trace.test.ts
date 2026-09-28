import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { RobberInput } from "./types";

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

/** Independent brute force: every subset with no two adjacent (n ≤ 8, so ≤ 256). */
function bruteForce(nums: number[]): number {
  let best = 0;
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let sum = 0;
    let ok = true;
    for (let i = 0; i < nums.length; i++) {
      if ((mask & (1 << i)) !== 0) {
        if (i > 0 && (mask & (1 << (i - 1))) !== 0) {
          ok = false;
          break;
        }
        sum += nums[i];
      }
    }
    if (ok) best = Math.max(best, sum);
  }
  return best;
}

function mustParse(raw: string): RobberInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("house-robber presets", () => {
  it.each([
    ["2 7 9 3 1", 12, [0, 2, 4], 11],
    ["1 2 3 1", 4, [0, 2], 9],
    ["2 1 1 2", 4, [0, 3], 9],
  ])("%s -> %i from %j over %i steps", (preset, expected, expectedRobbed, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps.length).toBeLessThanOrEqual(60);
    const last = steps[steps.length - 1].state;
    expect(last.dp[last.dp.length - 1]).toBe(expected);
    expect(last.robbed).toEqual(expectedRobbed);
  });
});

describe("house-robber trace shape", () => {
  const inputs = [...meta.presets, "5", "0 0 0"];

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
      expect(steps[0].state.dp[0]).toBe(0);
      expect(steps[0].state.robbed).toBeNull();
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("fills one dp cell per decide step", () => {
    const steps = trace(mustParse("2 7 9 3 1"));
    expect(steps[steps.length - 1].note).toBe("Done. The best haul is 12, from houses 1, 3 and 5.");
    const decides = steps.filter((step) => step.state.phase === "decide");
    expect(decides.map((step) => step.state.dp)).toEqual([
      [0, 2, 7, null, null, null],
      [0, 2, 7, 11, null, null],
      [0, 2, 7, 11, 11, null],
      [0, 2, 7, 11, 11, 12],
    ]);
  });

  it("a lone house is taken without any comparing", () => {
    const steps = trace(mustParse("5"));
    expect(steps.map((step) => step.state.phase)).toEqual(["setup", "base", "done"]);
    expect(steps[steps.length - 1].state.robbed).toEqual([0]);
  });
});

describe("house-robber property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20261212);
    const int = (min: number, max: number): number =>
      min + Math.floor(rand() * (max - min + 1));
    for (let k = 0; k < 300; k++) {
      // Zeros and repeats force ties and empty plans into the mix.
      const nums = Array.from({ length: int(1, 8) }, () =>
        rand() < 0.25 ? int(0, 2) : int(0, 99),
      );
      const steps = trace(nums);
      expect(steps.length, `steps for ${JSON.stringify(nums)}`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      const last = steps[steps.length - 1].state;
      const answer = last.dp[last.dp.length - 1];
      expect(answer, `answer for ${JSON.stringify(nums)}`).toBe(bruteForce(nums));
      const robbed = last.robbed ?? [];
      for (let j = 1; j < robbed.length; j++) {
        expect(robbed[j]).toBeGreaterThan(robbed[j - 1] + 1);
      }
      expect(robbed.reduce((sum, h) => sum + nums[h], 0)).toBe(answer);
    }
  });
});

describe("house-robber parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("2 7 9 3 1")).toEqual([2, 7, 9, 3, 1]);
    expect(parseInput("1 2 3 1")).toEqual([1, 2, 3, 1]);
    expect(parseInput("2 1 1 2")).toEqual([2, 1, 1, 2]);
  });

  it("accepts commas and extra spacing", () => {
    expect(parseInput("2,7,9,3,1")).toEqual([2, 7, 9, 3, 1]);
    expect(parseInput("  1   2  3  1 ")).toEqual([1, 2, 3, 1]);
  });

  it.each([
    ["", "one per house"],
    ["1 2 3 4 5 6 7 8 9", "You entered 9"],
    ["2 x 3", "whole number"],
    ["2.5 3", "whole number"],
    ["-1 3", "0 to 99"],
    ["100 3", "0 to 99"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
