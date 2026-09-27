import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { HeapItem, MedianInput, MedianState } from "./types";

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

/** Independent brute force: sort each prefix and take its median. */
function bruteForce(stream: number[]): number[] {
  return stream.map((_, end) => {
    const sorted = [...stream.slice(0, end + 1)].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  });
}

function mustParse(raw: string): MedianInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

function isHeap(heap: HeapItem[], above: (child: number, parent: number) => boolean): boolean {
  for (let k = 1; k < heap.length; k++) {
    if (above(heap[k].value, heap[(k - 1) >> 1].value)) return false;
  }
  return true;
}

/**
 * Structural shape holds on every step; the balance between the halves only
 * settles once the balancing move lands (see docs/patterns/QUESTIONS.md).
 */
function checkInvariants(state: MedianState): void {
  expect(isHeap(state.low, (child, parent) => child > parent)).toBe(true);
  expect(isHeap(state.high, (child, parent) => child < parent)).toBe(true);
  if (state.phase === "push" || state.phase === "setup") return;
  expect(Math.abs(state.low.length - state.high.length)).toBeLessThanOrEqual(1);
  if (state.low.length > 0 && state.high.length > 0) {
    expect(state.low[0].value).toBeLessThanOrEqual(state.high[0].value);
  }
}

describe("median-two-heaps presets", () => {
  it.each([
    ["5 15 1 3", [5, 10, 5, 4], 16],
    ["2 3 4", [2, 2.5, 3], 13],
    ["6 10 2 6 5 0", [6, 8, 6, 6, 6, 5.5], 23],
  ])("%s -> medians %j over %i steps", (preset, expectedMedians, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps.length).toBeLessThanOrEqual(60);
    expect(steps[steps.length - 1].state.medians).toEqual(expectedMedians);
    for (const step of steps) checkInvariants(step.state);
  });
});

describe("median-two-heaps trace shape", () => {
  const inputs = [...meta.presets, "7", "-4 0 4"];

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
      expect(steps[0].state.index).toBe(-1);
      expect(steps[0].state.low).toEqual([]);
      expect(steps[0].state.high).toEqual([]);
      expect(steps[0].state.medians).toEqual([]);
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("skips the rebalance step when the halves are already even", () => {
    // The 2nd number lands while the halves are even, so no rebalance step.
    const phases = trace(mustParse("5 15 1 3"))
      .slice(1, 8)
      .map((step) => step.state.phase);
    expect(phases).toEqual(["push", "moveUp", "rebalance", "median", "push", "moveUp", "median"]);
  });

  it("keeps item ids stable so the view can glide values between heaps", () => {
    for (const step of trace(mustParse("5 15 1 3"))) {
      const ids = [...step.state.low, ...step.state.high].map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const item of [...step.state.low, ...step.state.high]) {
        expect(item.value).toBe(step.state.stream[item.id]);
      }
    }
  });
});

describe("median-two-heaps property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20260909);
    const int = (min: number, max: number): number =>
      min + Math.floor(rand() * (max - min + 1));
    for (let k = 0; k < 300; k++) {
      const stream = Array.from({ length: int(1, 8) }, () =>
        rand() < 0.3 ? int(-5, 5) : int(-99, 99),
      );
      const steps = trace(stream);
      expect(steps.length, `steps for ${JSON.stringify(stream)}`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
        checkInvariants(step.state);
      }
      expect(steps[steps.length - 1].state.medians, `medians for ${JSON.stringify(stream)}`).toEqual(
        bruteForce(stream),
      );
    }
  });
});

describe("median-two-heaps parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("5 15 1 3")).toEqual([5, 15, 1, 3]);
    expect(parseInput("2 3 4")).toEqual([2, 3, 4]);
    expect(parseInput("6 10 2 6 5 0")).toEqual([6, 10, 2, 6, 5, 0]);
  });

  it("accepts commas and extra spacing", () => {
    expect(parseInput("5,15,1,3")).toEqual([5, 15, 1, 3]);
    expect(parseInput("  2   3  4 ")).toEqual([2, 3, 4]);
  });

  it.each([
    ["", "1–8 numbers from -99 to 99"],
    ["1 2 3 4 5 6 7 8 9", "You entered 9"],
    ["5 x 3", "whole number"],
    ["5.5 3", "whole number"],
    ["100 3", "-99 to 99"],
    ["5 -100", "-99 to 99"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
