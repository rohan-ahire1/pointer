import { describe, expect, it } from "vitest";
import { EXTRAS_KEY, getPattern, getPatterns, getProblem, getProblems, problemsForPattern } from "./index";
import { PATTERN_GUIDES } from "./guides";

const LEETCODE_URL_RE = /^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/$/;

/** The Blind 75 as LeetCode slugs (NeetCode's list, which uses Combination Sum rather than Combination Sum IV). */
const BLIND_75 = [
  "two-sum", "best-time-to-buy-and-sell-stock", "contains-duplicate", "product-of-array-except-self",
  "maximum-subarray", "maximum-product-subarray", "find-minimum-in-rotated-sorted-array",
  "search-in-rotated-sorted-array", "3sum", "container-with-most-water",
  "sum-of-two-integers", "number-of-1-bits", "counting-bits", "missing-number", "reverse-bits",
  "climbing-stairs", "coin-change", "longest-increasing-subsequence", "longest-common-subsequence",
  "word-break", "combination-sum", "house-robber", "house-robber-ii", "decode-ways", "unique-paths",
  "jump-game",
  "clone-graph", "course-schedule", "pacific-atlantic-water-flow", "number-of-islands",
  "longest-consecutive-sequence", "alien-dictionary", "graph-valid-tree",
  "number-of-connected-components-in-an-undirected-graph",
  "insert-interval", "merge-intervals", "non-overlapping-intervals", "meeting-rooms", "meeting-rooms-ii",
  "reverse-linked-list", "linked-list-cycle", "merge-two-sorted-lists", "merge-k-sorted-lists",
  "remove-nth-node-from-end-of-list", "reorder-list",
  "set-matrix-zeroes", "spiral-matrix", "rotate-image", "word-search",
  "longest-substring-without-repeating-characters", "longest-repeating-character-replacement",
  "minimum-window-substring", "valid-anagram", "group-anagrams", "valid-parentheses", "valid-palindrome",
  "longest-palindromic-substring", "palindromic-substrings", "encode-and-decode-strings",
  "maximum-depth-of-binary-tree", "same-tree", "invert-binary-tree", "binary-tree-maximum-path-sum",
  "binary-tree-level-order-traversal", "serialize-and-deserialize-binary-tree", "subtree-of-another-tree",
  "construct-binary-tree-from-preorder-and-inorder-traversal", "validate-binary-search-tree",
  "kth-smallest-element-in-a-bst", "lowest-common-ancestor-of-a-binary-search-tree",
  "implement-trie-prefix-tree", "design-add-and-search-words-data-structure", "word-search-ii",
  "top-k-frequent-elements", "find-median-from-data-stream",
];

/** LeetCode's premium-only problems on the list. */
const PREMIUM = [
  "encode-and-decode-strings", "alien-dictionary", "graph-valid-tree",
  "number-of-connected-components-in-an-undirected-graph", "meeting-rooms", "meeting-rooms-ii",
];

const leetcodeSlug = (url: string) => url.replace("https://leetcode.com/problems/", "").replace(/\/$/, "");

describe("patterns.json", () => {
  const patterns = getPatterns();

  it("has exactly 18 patterns", () => {
    expect(patterns).toHaveLength(18);
  });

  it("is numbered 1..18 with no gaps or repeats", () => {
    const numbers = patterns.map((pattern) => pattern.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
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

  it("links to exactly the Blind 75, each once", () => {
    expect(BLIND_75).toHaveLength(75);
    const linked = problems.map((problem) => leetcodeSlug(problem.leetcodeUrl));
    expect([...linked].sort()).toEqual([...BLIND_75].sort());
  });

  it("marks exactly LeetCode's premium problems as premium", () => {
    const premium = problems.filter((problem) => problem.premium).map((problem) => leetcodeSlug(problem.leetcodeUrl));
    expect(premium.sort()).toEqual([...PREMIUM].sort());
  });

  it("every difficulty is easy, medium or hard", () => {
    for (const problem of problems) {
      expect(["easy", "medium", "hard"], problem.slug).toContain(problem.difficulty);
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

describe("lesson copy", () => {
  it("only the problem a lesson's video shows says it was just watched", () => {
    for (const pattern of getPatterns()) {
      if (pattern.status !== "live") continue;
      for (const problem of problemsForPattern(pattern.slug)) {
        const watched = problem.twist?.startsWith("The one you just watched") ?? false;
        expect(watched, `${problem.slug} twist`).toBe(problem.visualizer === pattern.visualizer);
      }
    }
  });

  it("every video transcript has four beats inside the video, in order", () => {
    for (const pattern of getPatterns()) {
      if (pattern.status !== "live") continue;
      const times = pattern.video.transcript.map((entry) => entry.t);
      expect(times, pattern.slug).toHaveLength(4);
      expect(times[0], pattern.slug).toBe(0);
      expect([...times].sort((a, b) => a - b), pattern.slug).toEqual(times);
      expect(times.at(-1)!, pattern.slug).toBeLessThan(pattern.video.durationSec);
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
