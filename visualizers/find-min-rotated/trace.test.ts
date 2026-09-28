import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { FindMinInput } from "./types";

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

function mustParse(raw: string): FindMinInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("find-min-rotated presets", () => {
  it.each([
    ["4 5 6 7 0 1 2", 0, 8],
    ["3 4 5 1 2", 1, 6],
    ["11 13 15 17", 11, 6],
  ])("%s -> minimum %i over %i steps", (preset, expectedMin, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps[steps.length - 1].state.answer).toBe(expectedMin);
  });

  it("draws the halving trail 7 → 3 → 2 → 1 for the first preset", () => {
    const steps = trace(mustParse("4 5 6 7 0 1 2"));
    expect(steps[steps.length - 1].state.sizes).toEqual([7, 3, 2, 1]);
  });

  it("handles a single number in two steps", () => {
    const steps = trace(mustParse("5"));
    expect(steps).toHaveLength(2);
    expect(steps[steps.length - 1].state.answer).toBe(5);
  });
});

describe("find-min-rotated trace shape", () => {
  const inputs = [...meta.presets, "5", "2 1", "1 2 3 4 5"];

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
      expect(steps[0].state.mid).toBeNull();
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("the search space shrinks every decision and ends at one number", () => {
    for (const preset of inputs) {
      const steps = trace(mustParse(preset));
      const sizes = steps[steps.length - 1].state.sizes;
      expect(sizes[0]).toBe(mustParse(preset).length);
      expect(sizes[sizes.length - 1]).toBe(1);
      for (let k = 1; k < sizes.length; k++) {
        expect(sizes[k]).toBeLessThan(sizes[k - 1] as number);
      }
    }
  });
});

describe("find-min-rotated property test", () => {
  it("matches Math.min and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20260505);
    for (let k = 0; k < 300; k++) {
      // A sorted distinct list, rotated by a random amount (the spec's
      // generator); serialized so parseInput gets exercised too.
      const len = 1 + Math.floor(rand() * 10);
      const pool = new Set<number>();
      while (pool.size < len) {
        pool.add(-99 + Math.floor(rand() * 199));
      }
      const sorted = [...pool].sort((a, b) => a - b);
      const cut = Math.floor(rand() * len);
      const nums = [...sorted.slice(cut), ...sorted.slice(0, cut)];
      const steps = trace(mustParse(nums.join(" ")));
      expect(steps.length, `steps for ${JSON.stringify(nums)}`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      expect(steps[steps.length - 1].state.answer).toBe(Math.min(...nums));
    }
  });
});

describe("find-min-rotated parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("4 5 6 7 0 1 2")).toEqual([4, 5, 6, 7, 0, 1, 2]);
    expect(parseInput("3 4 5 1 2")).toEqual([3, 4, 5, 1, 2]);
    expect(parseInput("3,4, 5,1,2")).toEqual([3, 4, 5, 1, 2]);
    expect(parseInput("11 13 15 17")).toEqual([11, 13, 15, 17]);
  });

  it("accepts an unrotated list and a single number", () => {
    expect(parseInput("1 2 3")).toEqual([1, 2, 3]);
    expect(parseInput("5")).toEqual([5]);
  });

  it.each([
    ["", "1–10 different numbers"],
    ["1 2 2 3", "different"],
    ["1 3 2", "rotation of a sorted list"],
    ["2 1 4 3", "rotation of a sorted list"],
    ["1 x 3", "whole number"],
    ["100 1", "-99 to 99"],
    ["1 2 3 4 5 6 7 8 9 10 11", "1–10 different numbers"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
