import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { MergeInput } from "./types";

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

type Pair = [number, number];

const overlaps = (a: Pair, b: Pair): boolean => a[0] <= b[1] && b[0] <= a[1];

/**
 * Independent brute force: repeatedly merge any two overlapping intervals
 * (touching counts) until none overlap, then sort by start.
 */
function bruteForce(pairs: Pair[]): Pair[] {
  const rest: Pair[] = pairs.map(([start, end]) => [start, end]);
  for (let k = 0; k < rest.length; k++) {
    for (let m = k + 1; m < rest.length; m++) {
      if (overlaps(rest[k], rest[m])) {
        rest[k] = [Math.min(rest[k][0], rest[m][0]), Math.max(rest[k][1], rest[m][1])];
        rest.splice(m, 1);
        // Start over: the merged pair may now overlap an earlier one.
        k = -1;
        break;
      }
    }
  }
  rest.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return rest;
}

function mustParse(raw: string): MergeInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

const mergedPairs = (raw: string): Pair[] =>
  trace(mustParse(raw))
    .at(-1)
    ?.state.merged.map((entry) => [entry.start, entry.end] as Pair) ?? [];

describe("merge-intervals presets", () => {
  it.each([
    ["1-3 2-6 8-10 15-18", [[1, 6], [8, 10], [15, 18]], 7],
    ["1-4 4-5", [[1, 5]], 5],
    ["1-4 0-4", [[0, 4]], 5],
  ])("%s -> %j over %i steps", (preset, expected, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset as string));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps.length).toBeLessThanOrEqual(60);
    expect(mergedPairs(preset as string)).toEqual(expected);
  });
});

describe("merge-intervals trace shape", () => {
  const inputs = [...meta.presets, "5-5", "2-5 2-3"];

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
      expect(steps[0].state.merged).toEqual([]);
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("sorts once, even when nothing moves", () => {
    const sorted = trace(mustParse("1-3 2-6 8-10 15-18"));
    expect(sorted[1].state.phase).toBe("sort");
    expect(sorted[1].note).toBe("Already sorted by start.");
    const moved = trace(mustParse("1-4 0-4"));
    expect(moved[1].note).toBe("Sort them by where they start.");
    expect(moved[1].state.items.map((item) => item.id)).toEqual([1, 0]);
  });

  it("keeps input order for equal starts (stable sort)", () => {
    const steps = trace(mustParse("2-5 2-3"));
    expect(steps[1].note).toBe("Already sorted by start.");
    expect(steps[1].state.items.map((item) => item.id)).toEqual([0, 1]);
    expect(steps[3].note).toBe("[2, 3] sits inside [2, 5], so nothing changes.");
    expect(mergedPairs("2-5 2-3")).toEqual([[2, 5]]);
  });

  it("walks the first preset with the spec's narration", () => {
    const steps = trace(mustParse("1-3 2-6 8-10 15-18"));
    expect(steps.map((step) => step.state.phase)).toEqual([
      "setup",
      "sort",
      "seed",
      "stretch",
      "new",
      "new",
      "done",
    ]);
    expect(steps[2].note).toBe("The first one starts the merged list: [1, 3].");
    expect(steps[3].note).toBe("[2, 6] starts at 2, inside [1, 3]. Stretch it to [1, 6].");
    expect(steps[4].note).toBe("[8, 10] starts after 6. Start a new merged interval.");
    expect(steps[6].note).toBe("Done. 3 merged intervals: [1, 6], [8, 10] and [15, 18].");
  });

  it("treats touching intervals as overlapping", () => {
    const steps = trace(mustParse("1-4 4-5"));
    expect(steps[3].note).toBe("[4, 5] starts at 4, touching [1, 4]. Stretch it to [1, 5].");
    expect(steps[4].note).toBe("Done. 1 merged interval: [1, 5].");
  });

  it("tracks which input ids folded into each merged entry", () => {
    const last = trace(mustParse("1-3 2-6 8-10 15-18")).at(-1)?.state;
    expect(last?.merged.map((entry) => entry.from)).toEqual([[0, 1], [2], [3]]);
    expect(last?.outcomes).toEqual({ 0: "seed", 1: "merged", 2: "new", 3: "new" });
  });
});

describe("merge-intervals property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20261515);
    const int = (min: number, max: number): number =>
      min + Math.floor(rand() * (max - min + 1));
    // Short spans cluster on the line so overlaps, touches and contained
    // intervals all appear; the odd wide span keeps easy cases in the mix.
    const input = (): MergeInput => {
      const n = int(1, 6);
      return Array.from({ length: n }, (_, id) => {
        const start = int(0, 20);
        const span = rand() < 0.8 ? int(0, 5) : int(0, 20 - start);
        return { id, start, end: Math.min(20, start + span) };
      });
    };
    for (let k = 0; k < 300; k++) {
      const items = input();
      const steps = trace(items);
      expect(steps.length, `steps for ${JSON.stringify(items)}`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      const last = steps[steps.length - 1].state;
      const pairs = items.map((item) => [item.start, item.end] as Pair);
      expect(
        last.merged.map((entry) => [entry.start, entry.end]),
        `merged for ${JSON.stringify(items)}`,
      ).toEqual(bruteForce(pairs));
      // Every input id is folded into exactly one merged entry, so the
      // view's merged bars always have a key and nothing is lost.
      const folded = last.merged.flatMap((entry) => entry.from).sort((a, b) => a - b);
      expect(folded).toEqual(items.map((item) => item.id));
      for (const entry of last.merged) {
        expect(entry.from.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("merge-intervals parseInput", () => {
  it("parses the presets with input-order ids", () => {
    expect(parseInput("1-3 2-6 8-10 15-18")).toEqual([
      { id: 0, start: 1, end: 3 },
      { id: 1, start: 2, end: 6 },
      { id: 2, start: 8, end: 10 },
      { id: 3, start: 15, end: 18 },
    ]);
    expect(parseInput("1-4 0-4")).toEqual([
      { id: 0, start: 1, end: 4 },
      { id: 1, start: 0, end: 4 },
    ]);
  });

  it("accepts commas and extra spacing", () => {
    expect(parseInput("  1-3, 2-6  ")).toEqual([
      { id: 0, start: 1, end: 3 },
      { id: 1, start: 2, end: 6 },
    ]);
  });

  it.each([
    ["", "1–6 intervals"],
    ["5", "start-end"],
    ["1-3 2-x", "start-end"],
    ["3-1", "starts after it ends"],
    ["0-21", "0 ≤ start ≤ end ≤ 20"],
    ["-1-3", "0 ≤ start ≤ end ≤ 20"],
    ["1-2 1-2 1-2 1-2 1-2 1-2 1-2", "You entered 7"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
