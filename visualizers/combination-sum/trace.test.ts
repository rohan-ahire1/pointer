import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { CombinationInput } from "./types";

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

/**
 * Independent brute force: plain recursion over counts — decide how many of
 * each candidate to take — rather than the traced push/recurse/pop walk.
 */
function bruteForce(candidates: number[], target: number): number[][] {
  const sorted = [...candidates].sort((a, b) => a - b);
  const found: number[][] = [];
  const counts = new Array<number>(sorted.length).fill(0);
  const choose = (i: number, rest: number): void => {
    if (i === sorted.length) {
      if (rest === 0) {
        found.push(sorted.flatMap((value, k) => new Array<number>(counts[k]).fill(value)));
      }
      return;
    }
    for (let n = 0; n * sorted[i] <= rest; n++) {
      counts[i] = n;
      choose(i + 1, rest - n * sorted[i]);
    }
    counts[i] = 0;
  };
  choose(0, target);
  return found.map((combo) => [...combo].sort((a, b) => a - b)).sort();
}

function mustParse(raw: string): CombinationInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("combination-sum presets", () => {
  it.each([
    ["2 3 6 7 | 7", [[2, 2, 3], [7]], 20],
    ["2 3 5 | 8", [[2, 2, 2, 2], [2, 3, 3], [3, 5]], 24],
    ["3 5 | 4", [], 5],
  ])("%s -> %j over %i steps", (preset, expected, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps.length).toBeLessThanOrEqual(60);
    expect(steps[steps.length - 1].state.results).toEqual(expected);
  });
});

describe("combination-sum trace shape", () => {
  const inputs = [...meta.presets, "2 4 | 6", "8 9 | 3"];

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
      expect(steps[0].state.path).toEqual([]);
      expect(steps[0].state.results).toEqual([]);
      expect(steps[0].state.tree).toHaveLength(1);
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("lists every combination in the done note when they fit", () => {
    const steps = trace(mustParse("2 3 6 7 | 7"));
    expect(steps[steps.length - 1].note).toBe("Done. 2 combinations: [2, 2, 3] and [7].");
  });

  it("says where the path is back to after pops", () => {
    const notes = trace(mustParse("2 3 6 7 | 7")).map((step) => step.note);
    expect(notes).toContain("Back to [2, 2]. Try 3. Path [2, 2, 3], still need 0.");
    expect(notes).toContain(
      "Back to the start. Try 7. Path [7], still need 0.",
    );
  });
});

describe("combination-sum property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20261010);
    const int = (min: number, max: number): number =>
      min + Math.floor(rand() * (max - min + 1));
    for (let k = 0; k < 300; k++) {
      // Small candidates and big targets grow the deepest trees.
      const pool = rand() < 0.7 ? [2, 3, 4, 5] : [2, 3, 4, 5, 6, 7, 8, 9];
      const shuffled = [...pool].sort(() => rand() - 0.5);
      const candidates = shuffled.slice(0, int(2, 4));
      const target = rand() < 0.7 ? int(7, 10) : int(1, 10);
      const steps = trace({ candidates, target });
      expect(steps.length, `steps for ${JSON.stringify({ candidates, target })}`).toBeLessThanOrEqual(
        150,
      );
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      const actual = steps[steps.length - 1].state.results
        .map((combo) => [...combo].sort((a, b) => a - b))
        .sort();
      expect(actual, `results for ${JSON.stringify({ candidates, target })}`).toEqual(
        bruteForce(candidates, target),
      );
    }
  });
});

describe("combination-sum parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("2 3 6 7 | 7")).toEqual({ candidates: [2, 3, 6, 7], target: 7 });
    expect(parseInput("2 3 5 | 8")).toEqual({ candidates: [2, 3, 5], target: 8 });
    expect(parseInput("3 5 | 4")).toEqual({ candidates: [3, 5], target: 4 });
  });

  it("accepts commas and extra spacing", () => {
    expect(parseInput("2,3,6,7|7")).toEqual({ candidates: [2, 3, 6, 7], target: 7 });
    expect(parseInput("  3   5  |  4 ")).toEqual({ candidates: [3, 5], target: 4 });
  });

  it.each([
    ["", "then | and a target from 1 to 10"],
    ["2 3 6 7", "one | between"],
    ["2 3 | 7 | 8", "one | between"],
    ["| 7", "before the |"],
    ["2 | 7", "2–4 candidates"],
    ["2 3 4 5 6 | 7", "2–4 candidates"],
    ["2 x | 7", "whole number"],
    ["1 3 | 7", "from 2 to 9"],
    ["2 10 | 7", "from 2 to 9"],
    ["2 2 3 | 7", "different numbers"],
    ["2 3 |", "after the |"],
    ["2 3 | 7 8", "one whole number"],
    ["2 3 | x", "one whole number"],
    ["2 3 | 0", "from 1 to 10"],
    ["2 3 | 11", "from 1 to 10"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
