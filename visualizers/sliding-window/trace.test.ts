import { describe, expect, it } from "vitest";
import { code } from "./code";
import { trace } from "./trace";

describe("trace", () => {
  it.each([
    ["abcabcbb", 3, 25],
    ["bbbbb", 1, 16],
    ["pwwkew", 3, 17],
  ])("%s -> best %i over %i steps", (input, expectedBest, expectedStepCount) => {
    const steps = trace(input);
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps[steps.length - 1].state.best).toBe(expectedBest);
  });

  it("is deterministic — the same input always produces the same steps", () => {
    expect(trace("abcabcbb")).toEqual(trace("abcabcbb"));
    expect(trace("pwwkew")).toEqual(trace("pwwkew"));
  });

  it("every step's lines are valid indices into code", () => {
    for (const preset of ["abcabcbb", "bbbbb", "pwwkew"]) {
      for (const step of trace(preset)) {
        for (const line of step.lines) {
          expect(line, `line ${line} for preset "${preset}"`).toBeGreaterThanOrEqual(0);
          expect(line, `line ${line} for preset "${preset}"`).toBeLessThan(code.length);
        }
      }
    }
  });

  it("never lets the window shrink to before position 0 or grow past the string", () => {
    for (const step of trace("abcabcbb")) {
      expect(step.state.l).toBeGreaterThanOrEqual(0);
      expect(step.state.r).toBeLessThan("abcabcbb".length);
    }
  });

  it("first step starts with an empty window and no best yet", () => {
    const [first] = trace("abcabcbb");
    expect(first.state.l).toBe(0);
    expect(first.state.r).toBe(-1);
    expect(first.state.best).toBe(0);
    expect(first.state.seen).toEqual([]);
  });
});
