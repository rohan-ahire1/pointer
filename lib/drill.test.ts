import { describe, expect, it } from "vitest";
import { getPatterns, getProblems } from "@/content";
import { buildRound, DRILL_OPTION_COUNT, DRILL_ROUND_SIZE, shuffled } from "./drill";

/** mulberry32: a tiny seeded PRNG so every run sees the same rounds. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const patterns = getPatterns();
const problems = getProblems();

describe("buildRound", () => {
  it("gives a full round of unique problems", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const round = buildRound(problems, patterns, { random: seeded(seed) });
      expect(round).toHaveLength(DRILL_ROUND_SIZE);
      expect(new Set(round.map((q) => q.problem.slug)).size).toBe(DRILL_ROUND_SIZE);
    }
  });

  it("never repeats a pattern while unused ones remain", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const round = buildRound(problems, patterns, { random: seeded(seed) });
      const slugs = round.map((q) => q.problem.pattern);
      expect(new Set(slugs).size).toBe(DRILL_ROUND_SIZE);
    }
  });

  it("always offers the right answer, and no pattern that also fits as a wrong one", () => {
    for (let seed = 1; seed <= 50; seed++) {
      for (const { problem, options } of buildRound(problems, patterns, { random: seeded(seed) })) {
        expect(options).toHaveLength(DRILL_OPTION_COUNT);
        expect(new Set(options).size).toBe(DRILL_OPTION_COUNT);
        expect(options).toContain(problem.pattern);
        for (const slug of problem.alsoFits ?? []) {
          expect(options, problem.slug).not.toContain(slug);
        }
      }
    }
  });

  it("leaves out Extras, which have no pattern to name", () => {
    const round = buildRound(problems, patterns, { random: seeded(3), size: 75 });
    expect(round.some((q) => q.problem.pattern === "extras")).toBe(false);
    expect(round).toHaveLength(66);
  });

  it("can stick to one group", () => {
    const round = buildRound(problems, patterns, { random: seeded(4), group: "structures" });
    const allowed = new Set(patterns.filter((p) => p.group === "structures").map((p) => p.slug));
    expect(round.every((q) => allowed.has(q.problem.pattern))).toBe(true);
  });

  it("can replay only the missed problems", () => {
    const only = ["two-sum", "3sum"];
    const round = buildRound(problems, patterns, { random: seeded(5), only });
    expect(round.map((q) => q.problem.slug).sort()).toEqual(["3sum", "two-sum"]);
  });
});

describe("shuffled", () => {
  it("keeps every item and leaves the input alone", () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffled(input, seeded(9)).sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});
