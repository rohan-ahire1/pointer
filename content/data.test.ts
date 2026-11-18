import { describe, expect, it } from "vitest";
import { EXTRAS_KEY, getPattern, getPatterns, getProblem, getProblems, problemsForPattern } from "./index";
import { PATTERN_GUIDES } from "./guides";
import { SOLUTIONS } from "./solutions";

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

/**
 * Problems added after the Blind 75: LeetCode number, difficulty and the lists
 * they're on. Checked against NeetCode's published list.
 */
const BEYOND_75: Record<string, [number, "easy" | "medium" | "hard", string[]]> = {
  "decode-string": [394, "medium", []],
  "basic-calculator-ii": [227, "medium", []],
  "daily-temperatures": [739, "medium", ["neetcode-150"]],
  "largest-rectangle-in-histogram": [84, "hard", ["neetcode-150"]],
  "trapping-rain-water": [42, "hard", ["neetcode-150"]],
  "sliding-window-maximum": [239, "hard", ["neetcode-150"]],
  "min-stack": [155, "medium", ["neetcode-150"]],
  "lru-cache": [146, "medium", ["neetcode-150"]],
  "time-based-key-value-store": [981, "medium", ["neetcode-150"]],
  "insert-delete-getrandom-o1": [380, "medium", []],
  "binary-search": [704, "easy", ["neetcode-150"]],
  "search-a-2d-matrix": [74, "medium", ["neetcode-150"]],
  "find-first-and-last-position-of-element-in-sorted-array": [34, "medium", []],
  "find-peak-element": [162, "medium", []],
  "koko-eating-bananas": [875, "medium", ["neetcode-150"]],
  "split-array-largest-sum": [410, "hard", []],
  "median-of-two-sorted-arrays": [4, "hard", ["neetcode-150"]],
  "range-sum-query-immutable": [303, "easy", []],
  "subarray-sum-equals-k": [560, "medium", []],
  "contiguous-array": [525, "medium", []],
  "continuous-subarray-sum": [523, "medium", []],
  "subarray-sums-divisible-by-k": [974, "medium", []],
  "rotting-oranges": [994, "medium", ["neetcode-150"]],
  "course-schedule-ii": [210, "medium", ["neetcode-150"]],
  "word-ladder": [127, "hard", ["neetcode-150"]],
  "bus-routes": [815, "hard", []],
};

/** LeetCode's premium-only problems on the list. */
const PREMIUM = [
  "encode-and-decode-strings", "alien-dictionary", "graph-valid-tree",
  "number-of-connected-components-in-an-undirected-graph", "meeting-rooms", "meeting-rooms-ii",
];

const leetcodeSlug = (url: string) => url.replace("https://leetcode.com/problems/", "").replace(/\/$/, "");

describe("patterns.json", () => {
  const patterns = getPatterns();

  it("has exactly 20 patterns", () => {
    expect(patterns).toHaveLength(20);
  });

  it("is numbered 1..20 with no gaps or repeats", () => {
    const numbers = patterns.map((pattern) => pattern.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("has unique slugs", () => {
    const slugs = patterns.map((pattern) => pattern.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("problems.json", () => {
  const problems = getProblems();

  it("has the Blind 75 plus exactly the problems added after it", () => {
    // If this ever fails, content/problems.json gained or lost a problem.
    // Report the actual count rather than silently adjusting this expectation.
    expect(problems).toHaveLength(BLIND_75.length + Object.keys(BEYOND_75).length);
  });

  it("every problem has its real LeetCode number, each used once", () => {
    const numbers = problems.map((problem) => problem.leetcodeNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
    for (const problem of problems) expect(Number.isInteger(problem.leetcodeNumber) && problem.leetcodeNumber > 0).toBe(true);
  });

  it("matches the LeetCode number and difficulty of every problem added after the Blind 75", () => {
    for (const [slug, [number, difficulty, lists]] of Object.entries(BEYOND_75)) {
      const problem = problems.find((p) => p.slug === slug);
      expect(problem, slug).toBeDefined();
      expect([problem?.leetcodeNumber, problem?.difficulty, problem?.lists], slug).toEqual([number, difficulty, lists]);
    }
  });

  it("tags exactly the Blind 75 as Blind 75, and every one of them is on the NeetCode 150 too", () => {
    const tagged = problems.filter((problem) => problem.lists.includes("blind-75"));
    expect(tagged.map((problem) => leetcodeSlug(problem.leetcodeUrl)).sort()).toEqual([...BLIND_75].sort());
    for (const problem of tagged) expect(problem.lists, problem.slug).toContain("neetcode-150");
  });

  it("every problem added after the Blind 75 comes with a worked solution", () => {
    for (const problem of problems) {
      if (problem.lists.includes("blind-75")) continue;
      expect(SOLUTIONS[problem.slug], `${problem.slug} solution`).toBeDefined();
    }
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

  it("links to the Blind 75 and every added problem, each once", () => {
    expect(BLIND_75).toHaveLength(75);
    const linked = problems.map((problem) => leetcodeSlug(problem.leetcodeUrl));
    expect([...linked].sort()).toEqual([...BLIND_75, ...Object.keys(BEYOND_75)].sort());
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

describe("lesson sections", () => {
  it("split a lesson's problems into named groups, in the same order", () => {
    for (const pattern of getPatterns()) {
      if (pattern.status !== "live" || !pattern.sections) continue;
      expect(pattern.sections.flatMap((section) => section.problems), pattern.slug).toEqual(pattern.problems);
      const titles = pattern.sections.map((section) => section.title);
      expect(new Set(titles).size, pattern.slug).toBe(titles.length);
      for (const section of pattern.sections) {
        expect(section.problems.length, section.title).toBeGreaterThan(0);
        expect(section.note.length, section.title).toBeGreaterThan(10);
        expect(section.note.length, section.title).toBeLessThanOrEqual(110);
      }
    }
  });

  it("order every lesson's problems from easy to hard", () => {
    const rank = { easy: 0, medium: 1, hard: 2 };
    for (const pattern of getPatterns()) {
      const ranks = problemsForPattern(pattern.slug).map((problem) => rank[problem.difficulty]);
      expect(ranks, pattern.slug).toEqual([...ranks].sort((a, b) => a - b));
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
