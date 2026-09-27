import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { ReverseInput, ReverseState } from "./types";

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

function mustParse(raw: string): ReverseInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

/** Follow `next` links from `at`, collecting every reachable node. */
function reachable(state: ReverseState, at: number | null): Set<number> {
  const seen = new Set<number>();
  for (let k = at; k !== null; k = state.next[k]) {
    if (seen.has(k)) break;
    seen.add(k);
  }
  return seen;
}

describe("reverse-linked-list presets", () => {
  it.each([
    ["1 2 3 4 5", "5 → 4 → 3 → 2 → 1", 17],
    ["1 2", "2 → 1", 8],
    ["7", "7", 5],
  ])("%s -> %s over %i steps", (preset, expectedChain, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    const last = steps[steps.length - 1];
    expect(last.note).toBe(`Done. prev is the new head: ${expectedChain}.`);
  });

  it("names the flipping node only on flip steps", () => {
    for (const step of trace(mustParse("1 2 3 4 5"))) {
      if (step.state.phase === "flip") {
        expect(step.state.flipping).not.toBeNull();
      } else {
        expect(step.state.flipping).toBeNull();
      }
    }
  });
});

describe("reverse-linked-list trace shape", () => {
  const inputs = [...meta.presets, "9 -9 0", "-1 -2 -3"];

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
      expect(steps[0].state.prev).toBeNull();
      expect(steps[0].state.curr).toBe(0);
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("never loses a node: every node stays reachable from prev, curr or next", () => {
    // The spec's parenthetical says "from prev or from curr", but on a flip
    // step the tail hangs only off the saved `next` — that is the whole
    // point of saving it first. See docs/patterns/QUESTIONS.md.
    for (const preset of inputs) {
      const values = mustParse(preset);
      for (const step of trace(values)) {
        const held = new Set([
          ...reachable(step.state, step.state.prev),
          ...reachable(step.state, step.state.curr),
          ...reachable(step.state, step.state.nxt),
        ]);
        expect([...held].sort((a, b) => a - b)).toEqual(values.map((_, k) => k));
      }
    }
  });
});

describe("reverse-linked-list property test", () => {
  it("reverses the list and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20260606);
    for (let k = 0; k < 300; k++) {
      const len = 1 + Math.floor(rand() * 7);
      const values = Array.from({ length: len }, () => -99 + Math.floor(rand() * 199));
      const steps = trace(values);
      expect(steps.length, `steps for ${JSON.stringify(values)}`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      // Brute force: follow `next` from the returned `prev` in the final
      // state and compare with the reversed input.
      const last = steps[steps.length - 1].state;
      const chain: number[] = [];
      for (let at = last.prev; at !== null; at = last.next[at]) {
        chain.push(last.values[at]);
      }
      expect(chain).toEqual([...values].reverse());
      expect([...last.reversed].sort((a, b) => a - b)).toEqual(values.map((_, i) => i));
    }
  });
});

describe("reverse-linked-list parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("1 2 3 4 5")).toEqual([1, 2, 3, 4, 5]);
    expect(parseInput("1 2")).toEqual([1, 2]);
    expect(parseInput("7")).toEqual([7]);
  });

  it.each([
    ["", "1–7 numbers"],
    ["1 2 3 4 5 6 7 8", "1–7 numbers"],
    ["1 x 3", "whole numbers"],
    ["100 3", "-99 to 99"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
