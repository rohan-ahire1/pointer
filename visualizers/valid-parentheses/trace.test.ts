import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { ParensInput } from "./types";

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

/** Independent brute force: delete adjacent pairs until nothing changes. */
function bruteForce(s: string): boolean {
  let prev = s;
  for (;;) {
    const next = prev.replace(/\(\)|\[\]|\{\}/g, "");
    if (next === prev) return next === "";
    prev = next;
  }
}

function mustParse(raw: string): ParensInput {
  const parsed = parseInput(raw);
  if (typeof parsed !== "string") throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("valid-parentheses presets", () => {
  it.each([
    ["()[]{}", true, 8],
    ["{[()]}", true, 8],
    ["([)]", false, 5],
  ])("%s -> %s over %i steps", (preset, expectedVerdict, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps[steps.length - 1].state.verdict).toBe(expectedVerdict);
  });

  it("names the failure: empty pop, mismatch, and leftover opener", () => {
    expect(trace(mustParse(")"))[1].state.phase).toBe("empty");
    const mismatch = trace(mustParse("([)]"));
    expect(mismatch[3].state.phase).toBe("mismatch");
    expect(mismatch[3].state.failedAt).toBe(2);
    expect(trace(mustParse("(("))[3].note).toBe("Done. ‘(’ is still waiting, so it’s invalid.");
  });
});

describe("valid-parentheses trace shape", () => {
  const inputs = [...meta.presets, "((", ")", "((()))", "}{"];

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
      expect(steps[0].state.stack).toEqual([]);
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("a valid run settles every index, an invalid run leaves the failure visible", () => {
    const valid = trace(mustParse("{[()]}"));
    expect([...valid[valid.length - 1].state.matched].sort((a, b) => a - b)).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
    const invalid = trace(mustParse("([)]"));
    const last = invalid[invalid.length - 1].state;
    expect(last.verdict).toBe(false);
    expect(last.stack.map((plate) => plate.ch)).toEqual(["(", "["]);
    expect(last.failedAt).toBe(2);
  });
});

describe("valid-parentheses property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20260404);
    const brackets = ["(", ")", "[", "]", "{", "}"];
    for (let k = 0; k < 300; k++) {
      const len = 1 + Math.floor(rand() * 12);
      const s = Array.from({ length: len }, () => brackets[Math.floor(rand() * 6)] as string).join(
        "",
      );
      const steps = trace(s);
      expect(steps.length, `steps for "${s}"`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      expect(steps[steps.length - 1].state.verdict, `verdict for "${s}"`).toBe(bruteForce(s));
    }
  });
});

describe("valid-parentheses parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("()[]{}")).toBe("()[]{}");
    expect(parseInput("{[()]}")).toBe("{[()]}");
    expect(parseInput("([)]")).toBe("([)]");
  });

  it("ignores anything that isn't a bracket and caps the length at 12", () => {
    expect(parseInput("a(b) [c]")).toBe("()[]");
    expect(parseInput("(((((((((((((")).toBe("((((((((((((");
  });

  it.each([
    ["", "1–12 brackets"],
    ["abc", "1–12 brackets"],
    ["   ", "1–12 brackets"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect(typeof result).not.toBe("string");
    if (typeof result !== "string") expect(result.error).toContain(hint);
  });
});
