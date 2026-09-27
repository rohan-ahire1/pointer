import { describe, expect, it } from "vitest";
import { EXTRAS_KEY, getPattern, getPatterns, getProblem, getProblems, problemsForPattern } from "./index";

const LEETCODE_URL_RE = /^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/$/;

describe("patterns.json", () => {
  const patterns = getPatterns();

  it("has exactly 15 patterns", () => {
    expect(patterns).toHaveLength(15);
  });

  it("is numbered 1..15 with no gaps or repeats", () => {
    const numbers = patterns.map((pattern) => pattern.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
  });

  it("has unique slugs", () => {
    const slugs = patterns.map((pattern) => pattern.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("problems.json", () => {
  const problems = getProblems();

  it("has exactly 75 problems (the Blind 75)", () => {
    // If this ever fails, it means content/problems.json no longer matches
    // the Blind 75 list — report the actual count rather than silently
    // adjusting this expectation.
    expect(problems).toHaveLength(75);
  });

  it("has unique slugs", () => {
    const slugs = problems.map((problem) => problem.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every leetcodeUrl has the https://leetcode.com/problems/<slug>/ shape", () => {
    for (const problem of problems) {
      expect(problem.leetcodeUrl, `${problem.slug} leetcodeUrl`).toMatch(LEETCODE_URL_RE);
    }
  });

  it("every problem's `pattern` is a known pattern slug or the extras bucket", () => {
    for (const problem of problems) {
      if (problem.pattern === EXTRAS_KEY) continue;
      expect(getPattern(problem.pattern), `${problem.slug} pattern "${problem.pattern}"`).toBeDefined();
    }
  });

  it("every non-extras problem is listed by the pattern it claims", () => {
    for (const problem of problems) {
      if (problem.pattern === EXTRAS_KEY) continue;
      const owner = getPattern(problem.pattern);
      expect(owner?.problems, `${problem.slug} listed by ${problem.pattern}`).toContain(problem.slug);
    }
  });
});

describe("cross-references between patterns and problems", () => {
  const patterns = getPatterns();

  it("every problem slug a pattern references actually exists", () => {
    for (const pattern of patterns) {
      for (const slug of pattern.problems) {
        expect(getProblem(slug), `${pattern.slug} references problem "${slug}"`).toBeDefined();
      }
    }
  });

  it("every problem a pattern references points back at that pattern", () => {
    for (const pattern of patterns) {
      for (const slug of pattern.problems) {
        const problem = getProblem(slug);
        expect(problem?.pattern, `problem "${slug}" pattern`).toBe(pattern.slug);
      }
    }
  });

  it("problemsForPattern returns the same problems the pattern lists, in order", () => {
    for (const pattern of patterns) {
      const resolved = problemsForPattern(pattern.slug);
      expect(resolved.map((p) => p.slug)).toEqual(pattern.problems);
    }
  });

  it("problemsForPattern returns [] for an unknown slug", () => {
    expect(problemsForPattern("not-a-real-pattern")).toEqual([]);
  });
});
