/**
 * The pattern drill: read a problem, name the pattern. Picking the pattern is
 * the part of an interview a step-by-step lesson can't practise. Everything
 * here is pure, with the random source passed in so tests can fix it.
 */
import { EXTRAS_KEY, type Pattern, type PatternGroup, type Problem } from "@/content";

export const DRILL_ROUND_SIZE = 10;
export const DRILL_OPTION_COUNT = 4;

export type DrillQuestion = {
  problem: Problem;
  /** Slugs of the pattern choices, shuffled. Always includes `problem.pattern`. */
  options: string[];
};

type Random = () => number;

export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Three wrong answers, never a pattern that would fairly solve the problem. */
function buildOptions(problem: Problem, patterns: readonly Pattern[], random: Random): string[] {
  const unfair = new Set([problem.pattern, ...(problem.alsoFits ?? [])]);
  const wrong = shuffled(
    patterns.filter((pattern) => !unfair.has(pattern.slug)),
    random,
  ).slice(0, DRILL_OPTION_COUNT - 1);
  return shuffled([problem.pattern, ...wrong.map((pattern) => pattern.slug)], random);
}

/**
 * Picks questions so a round covers as many patterns as it can before any
 * pattern repeats, rather than ten random picks that can bunch up on trees.
 */
function pickSpread(problems: readonly Problem[], size: number, random: Random): Problem[] {
  const picked: Problem[] = [];
  let pool = shuffled(problems, random);
  while (picked.length < size && pool.length > 0) {
    const used = new Set<string>();
    const rest: Problem[] = [];
    for (const problem of pool) {
      if (picked.length < size && !used.has(problem.pattern)) {
        used.add(problem.pattern);
        picked.push(problem);
      } else {
        rest.push(problem);
      }
    }
    pool = rest;
  }
  return picked;
}

export function buildRound(
  allProblems: readonly Problem[],
  patterns: readonly Pattern[],
  options: { random: Random; group?: PatternGroup | "all"; only?: readonly string[]; size?: number },
): DrillQuestion[] {
  const { random, group = "all", only, size = DRILL_ROUND_SIZE } = options;
  const inGroup = new Set(patterns.filter((p) => group === "all" || p.group === group).map((p) => p.slug));
  const eligible = allProblems.filter(
    (problem) =>
      problem.pattern !== EXTRAS_KEY && inGroup.has(problem.pattern) && (!only || only.includes(problem.slug)),
  );
  return pickSpread(eligible, size, random).map((problem) => ({
    problem,
    options: buildOptions(problem, patterns, random),
  }));
}
