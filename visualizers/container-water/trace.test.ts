import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { ContainerInput } from "./types";

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

/** Independent brute force: the best area over every pair of walls. */
function bruteForce(height: number[]): number {
  let best = 0;
  for (let i = 0; i < height.length; i++) {
    for (let j = i + 1; j < height.length; j++) {
      best = Math.max(best, Math.min(height[i], height[j]) * (j - i));
    }
  }
  return best;
}

function mustParse(raw: string): ContainerInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("container-water presets", () => {
  it.each([
    ["1 8 6 2 5 4 8 3 7", 49, 18],
    ["4 3 2 1 4", 16, 10],
    ["1 1", 1, 4],
  ])("%s -> best %i over %i steps", (preset, expectedBest, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps[steps.length - 1].state.best).toBe(expectedBest);
  });

  it("moves the right wall when both walls are equal", () => {
    const steps = trace(mustParse("1 1"));
    expect(steps[2].state.phase).toBe("move");
    expect(steps[2].state.moving).toBe("right");
    expect(steps[2].note).toBe("Both walls are 1. Move the right one in.");
  });
});

describe("container-water trace shape", () => {
  const inputs = [...meta.presets, "9 0 0 0 9", "5 4 3 2 1"];

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
      expect(steps[0].state.best).toBe(0);
      expect(steps[0].state.bestPair).toBeNull();
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("move steps name the wall that is about to move, measure steps name none", () => {
    for (const step of trace(mustParse("1 8 6 2 5 4 8 3 7"))) {
      if (step.state.phase === "move") {
        expect(step.state.moving).toMatch(/^(left|right)$/);
      } else {
        expect(step.state.moving).toBeNull();
      }
    }
  });
});

describe("container-water property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20260202);
    const int = (min: number, max: number): number =>
      min + Math.floor(rand() * (max - min + 1));
    for (let k = 0; k < 300; k++) {
      const height = Array.from({ length: int(2, 10) }, () => int(0, 9));
      const steps = trace(height);
      expect(steps.length, `steps for ${JSON.stringify(height)}`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      const last = steps[steps.length - 1].state;
      expect(last.best).toBe(bruteForce(height));
      // The recorded pair really produces `best` (null only when best is 0,
      // which no pair beats — e.g. all-zero walls).
      if (last.best > 0) {
        expect(last.bestPair).not.toBeNull();
        const [l, r] = last.bestPair as [number, number];
        expect(Math.min(height[l], height[r]) * (r - l)).toBe(last.best);
      } else {
        expect(last.bestPair).toBeNull();
      }
    }
  });
});

describe("container-water parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("1 8 6 2 5 4 8 3 7")).toEqual([1, 8, 6, 2, 5, 4, 8, 3, 7]);
    expect(parseInput("4 3 2 1 4")).toEqual([4, 3, 2, 1, 4]);
    expect(parseInput("1,8, 6")).toEqual([1, 8, 6]);
    expect(parseInput("1 1")).toEqual([1, 1]);
  });

  it.each([
    ["", "2–10 wall heights"],
    ["5", "2–10 wall heights"],
    ["1 2 3 4 5 6 7 8 9 0 1", "2–10 wall heights"],
    ["1 x 3", "wall height"],
    ["10 3", "0 to 9"],
    ["-1 3", "0 to 9"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
