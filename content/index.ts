import patternsData from "./patterns.json";
import problemsData from "./problems.json";
import type { Pattern, PatternGroup, Problem } from "./types";

export type { Pattern, PatternGroup, Problem, Difficulty, LivePattern, SoonPattern } from "./types";

const patterns = patternsData as Pattern[];
const problems = problemsData as Problem[];

/** The problems.json `pattern` value for the 9 Blind-75 problems that don't map to one of the 15 patterns. */
export const EXTRAS_KEY = "extras";

/** All 15 patterns, in lesson order (by `number`). */
export function getPatterns(): Pattern[] {
  return patterns;
}

/** A single pattern by slug, or `undefined` if it doesn't exist. */
export function getPattern(slug: string): Pattern | undefined {
  return patterns.find((pattern) => pattern.slug === slug);
}

/** All 75 Blind 75 problems. */
export function getProblems(): Problem[] {
  return problems;
}

/** A single problem by slug, or `undefined` if it doesn't exist. */
export function getProblem(slug: string): Problem | undefined {
  return problems.find((problem) => problem.slug === slug);
}

/**
 * The problems taught by a pattern, in the order the pattern lists them
 * (patterns.json's `problems` array of slugs) rather than problems.json's
 * declaration order. Slugs that don't resolve to a known problem are
 * skipped (shouldn't happen — see content/data.test.ts).
 */
export function problemsForPattern(slug: string): Problem[] {
  const pattern = getPattern(slug);
  if (!pattern) return [];
  const bySlug = new Map(problems.map((problem) => [problem.slug, problem] as const));
  return pattern.problems
    .map((problemSlug) => bySlug.get(problemSlug))
    .filter((problem): problem is Problem => problem !== undefined);
}

/** Display label + blurb for each of the 3 super-groups on /patterns (C2-Patterns mock). */
export const PATTERN_GROUPS: Record<PatternGroup, { label: string; description: string }> = {
  foundations: {
    label: "Foundations",
    description: "Start here. Arrays, pointers and windows.",
  },
  structures: {
    label: "Structures & Recursion",
    description: "Lists, trees and trying every option.",
  },
  advanced: {
    label: "Advanced",
    description: "Graphs, dynamic programming and greedy choices.",
  },
};

export type PatternGroupSummary = {
  key: PatternGroup;
  label: string;
  description: string;
  patterns: Pattern[];
};

/** Patterns grouped for /patterns, in Foundations / Structures & Recursion / Advanced order. */
export function getPatternGroups(): PatternGroupSummary[] {
  return (Object.keys(PATTERN_GROUPS) as PatternGroup[]).map((key) => ({
    key,
    ...PATTERN_GROUPS[key],
    patterns: patterns.filter((pattern) => pattern.group === key),
  }));
}

export type ProblemGroupSummary = {
  /** A Pattern["slug"], or EXTRAS_KEY. */
  key: string;
  label: string;
  /** The pattern this group belongs to, or `undefined` for the Extras group. */
  pattern: Pattern | undefined;
  problems: Problem[];
};

/**
 * Problems grouped by pattern (in lesson order) with a trailing "Extras"
 * group for the 9 problems that round out the Blind 75 but aren't taught by
 * any of the 15 patterns (math, bit tricks, one advanced graph problem —
 * see design/mocks/C2-Problems.dc.html).
 */
export function getProblemGroups(): ProblemGroupSummary[] {
  const groups: ProblemGroupSummary[] = patterns.map((pattern) => ({
    key: pattern.slug,
    label: pattern.name,
    pattern,
    problems: problemsForPattern(pattern.slug),
  }));

  const extras = problems.filter((problem) => problem.pattern === EXTRAS_KEY);
  if (extras.length > 0) {
    groups.push({
      key: EXTRAS_KEY,
      label: "Extras",
      pattern: undefined,
      problems: extras,
    });
  }

  return groups;
}
