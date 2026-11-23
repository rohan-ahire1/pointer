import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { NonOverlappingInput } from "./types";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";

type Pair = [number, number];

/**
 * Independent reference: the most intervals you can keep is the longest
 * chain where each starts at or after the previous end (dynamic programming
 * over start order), so removals = n − chain.
 */
function reference(pairs: Pair[]): number {
  const sorted = [...pairs].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const best: number[] = sorted.map(() => 1);
  let chain = 0;
  for (let k = 0; k < sorted.length; k++) {
    for (let m = 0; m < k; m++) {
      if (sorted[m][1] <= sorted[k][0]) best[k] = Math.max(best[k], best[m] + 1);
    }
    chain = Math.max(chain, best[k]);
  }
  return pairs.length - chain;
}

const parse = (raw: string) => mustParse<NonOverlappingInput>(parseInput, raw);
const removedOf = (steps: ReturnType<typeof trace>) => steps[steps.length - 1].state.removed;

describe("non-overlapping-intervals presets", () => {
  it("every preset is well formed", () => {
    for (const preset of meta.presets) {
      expectWellFormed(trace(parse(preset)), code);
    }
  });

  it.each([
    ["1-2 2-3 3-4 1-3", 1],
    ["1-2 1-2 1-2", 2],
    ["1-2 2-3", 0],
    ["1-10 2-3 4-5 6-7", 1],
  ])("%s removes %i", (preset, expected) => {
    expect(meta.presets).toContain(preset);
    expect(removedOf(trace(parse(preset)))).toBe(expected);
  });
});

describe("non-overlapping-intervals trace", () => {
  it("is deterministic", () => {
    for (const preset of meta.presets) {
      expect(trace(parse(preset))).toEqual(trace(parse(preset)));
    }
  });

  it("sorts by end and tells the keep/remove story", () => {
    const steps = trace(parse("1-2 2-3 3-4 1-3"));
    expect(steps.map((step) => step.state.phase)).toEqual([
      "setup",
      "sort",
      "seed",
      "keep",
      "remove",
      "keep",
      "done",
    ]);
    expect(steps[1].note).toBe("Sort them by where they end.");
    expect(steps[1].state.items.map((item) => item.id)).toEqual([0, 1, 3, 2]);
    expect(steps[3].note).toContain("Keep it");
    expect(steps[4].note).toContain("remove it");
    expect(steps[4].state.outcomes[3]).toBe("removed");
    expect(steps[6].note).toBe("Done. Remove 1 interval and the rest don’t overlap.");
  });

  it("says when nothing needs removing", () => {
    const steps = trace(parse("1-2 2-3"));
    expect(steps[1].note).toBe("Already sorted by end.");
    expect(steps[steps.length - 1].note).toBe("Done. Nothing overlaps, so remove 0 intervals.");
  });

  it("handles a single interval", () => {
    const steps = trace(parse("4-9"));
    expectWellFormed(steps, code);
    expect(removedOf(steps)).toBe(0);
  });

  it("matches a reference on 200 seeded random inputs", () => {
    const int = seeded(20261818);
    for (let k = 0; k < 200; k++) {
      const n = int(1, 6);
      const items: NonOverlappingInput = Array.from({ length: n }, (_, id) => {
        const start = int(0, 19);
        const len = int(1, 100) <= 80 ? int(1, 5) : int(1, 20);
        return { id, start, end: Math.min(20, start + len) };
      });
      const steps = trace(items);
      expectWellFormed(steps, code);
      const last = steps[steps.length - 1].state;
      const pairs = items.map((item) => [item.start, item.end] as Pair);
      expect(last.removed, JSON.stringify(pairs)).toBe(reference(pairs));
      expect(last.kept.length + last.removed).toBe(n);
    }
  });
});

describe("non-overlapping-intervals parseInput", () => {
  it("parses valid input with input-order ids", () => {
    expect(parseInput("1-2 2-3")).toEqual([
      { id: 0, start: 1, end: 2 },
      { id: 1, start: 2, end: 3 },
    ]);
    expect(parseInput("  1-2, 2-3  ")).toEqual(parseInput("1-2 2-3"));
  });

  it("accepts the LeetCode paste form", () => {
    expect(parseInput("[[1,2],[2,3],[3,4],[1,3]]")).toEqual(parseInput("1-2 2-3 3-4 1-3"));
  });

  it.each([
    ["", "1–6 intervals"],
    ["   ", "1–6 intervals"],
    ["5", "start-end"],
    ["1-2 3-x", "start-end"],
    ["3-1", "must start before it ends"],
    ["5-5", "must start before it ends"],
    ["0-21", "0 ≤ start < end ≤ 20"],
    ["-1-3", "0 ≤ start < end ≤ 20"],
    ["1-2 1-2 1-2 1-2 1-2 1-2 1-2", "You entered 7"],
  ])("%j is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
