import { problemsForPattern, type Pattern } from "@/content";
import type { Progress } from "@/lib/progress";

/**
 * "Started" (design/mocks/C2-Patterns.dc.html's filter): the reader has
 * either scrolled a lesson section (a `progress.lessons` entry exists) or
 * solved at least one of the pattern's problems. A "soon" pattern can still
 * show as started if one of its problems was solved from /problems before
 * its lesson exists.
 */
export function isPatternStarted(pattern: Pattern, progress: Progress): boolean {
  if (progress.lessons[pattern.slug] !== undefined) return true;
  return problemsForPattern(pattern.slug).some((problem) => progress.solved[problem.slug] === true);
}

/** How many of a pattern's problems are solved, out of how many it teaches. */
export function solvedCountForPattern(pattern: Pattern, progress: Progress): { done: number; total: number } {
  const problems = problemsForPattern(pattern.slug);
  const done = problems.filter((problem) => progress.solved[problem.slug] === true).length;
  return { done, total: problems.length };
}
