import { expect } from "vitest";
import type { Step } from "../types";

/** mulberry32: a tiny seeded PRNG (no dependency) for the property tests. */
export function seeded(seed: number): (min: number, max: number) => number {
  let a = seed >>> 0;
  return (min, max) => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return min + Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * (max - min + 1));
  };
}

/** The rules every trace follows: valid lines, short notes, a screen-reader line, setup first, done last. */
export function expectWellFormed<S extends { phase: string }>(
  steps: Step<S>[],
  code: readonly string[],
  maxSteps = 120,
): void {
  expect(steps.length).toBeGreaterThan(1);
  expect(steps.length).toBeLessThanOrEqual(maxSteps);
  expect(steps[0].state.phase).toBe("setup");
  const last = steps[steps.length - 1];
  expect(last.state.phase).toBe("done");
  expect(last.note.startsWith("Done.")).toBe(true);
  for (const step of steps) {
    expect(step.lines.length).toBeGreaterThan(0);
    for (const line of step.lines) {
      expect(line).toBeGreaterThanOrEqual(0);
      expect(line).toBeLessThan(code.length);
    }
    expect(step.note.length, step.note).toBeGreaterThan(0);
    expect(step.note.length, step.note).toBeLessThanOrEqual(110);
    expect(step.sr.length).toBeGreaterThan(0);
  }
}

export function mustParse<I>(parse: (raw: string) => I | { error: string }, raw: string): I {
  const parsed = parse(raw);
  if (typeof parsed === "object" && parsed !== null && "error" in parsed) {
    throw new Error(`should parse: "${raw}" (${parsed.error})`);
  }
  return parsed as I;
}
