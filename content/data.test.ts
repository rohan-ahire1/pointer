import { describe, expect, it } from "vitest";
import { EXTRAS_KEY, getPattern, getPatterns, getProblem, getProblems, problemsForPattern } from "./index";
import { PATTERN_GUIDES } from "./guides";

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

describe("problem hints and drill copy", () => {
  const problems = getProblems();

  it("every problem has a prompt, a signal and its complexity", () => {
    for (const problem of problems) {
      expect(problem.prompt.length, `${problem.slug} prompt`).toBeGreaterThan(10);
      expect(problem.signal.length, `${problem.slug} signal`).toBeGreaterThan(10);
      expect(problem.time, `${problem.slug} time`).toMatch(/^O\(/);
      expect(problem.space, `${problem.slug} space`).toMatch(/^O\(/);
    }
  });

  it("no prompt names its own pattern, since the drill asks you to guess it", () => {
    for (const problem of problems) {
      const pattern = getPattern(problem.pattern);
      if (!pattern) continue;
      expect(problem.prompt.toLowerCase(), problem.slug).not.toContain(pattern.name.toLowerCase());
    }
  });

  it("alsoFits only lists real patterns other than the problem's own", () => {
    for (const problem of problems) {
      for (const slug of problem.alsoFits ?? []) {
        expect(getPattern(slug), `${problem.slug} alsoFits ${slug}`).toBeDefined();
        expect(slug, problem.slug).not.toBe(problem.pattern);
      }
    }
  });
});

describe("pattern guides", () => {
  it("every pattern has a template in both languages and at least two pitfalls", () => {
    for (const pattern of getPatterns()) {
      const guide = PATTERN_GUIDES[pattern.slug];
      expect(guide, pattern.slug).toBeDefined();
      expect(guide?.template.ts.length).toBeGreaterThan(20);
      expect(guide?.template.py.length).toBeGreaterThan(20);
      expect(guide?.pitfalls.length).toBeGreaterThanOrEqual(2);
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
