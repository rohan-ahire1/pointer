import { getPattern, problemsForPattern, type LivePattern, type Problem } from "@/content";
import type { LessonSection, Progress } from "@/lib/progress";

export const SECTION_INDEX: Record<LessonSection, number> = {
  idea: 1,
  watch: 2,
  try: 3,
  solve: 4,
};

export const SECTION_LABEL: Record<LessonSection, string> = {
  idea: "The idea",
  watch: "Watch",
  try: "Try it",
  solve: "Solve",
};

export type ContinueLesson = {
  pattern: LivePattern;
  section: LessonSection;
  sectionIndex: number;
  sectionLabel: string;
  done: number;
  total: number;
  /** The first unsolved problem the pattern teaches, if any — "solve this next". */
  nextProblem?: Problem;
};

/**
 * The lesson to offer as "pick up where you left off" (Home's welcome
 * banner, the phone menu's Continue card, /progress's continue card): the
 * most recently updated entry in `progress.lessons` that still resolves to
 * a *live* pattern, by `updatedAt`. `setLessonSection` is only ever called
 * from a live lesson page, but a pattern can go from live back to soon in a
 * content edit, and a stale localStorage entry shouldn't crash the page —
 * so a non-live or unknown slug is skipped in favour of the next-most-recent
 * entry, rather than giving up entirely.
 */
export function getContinueLesson(progress: Progress): ContinueLesson | undefined {
  const entries = Object.entries(progress.lessons)
    .map(([slug, lesson]) => ({ slug, lesson, time: Date.parse(lesson.updatedAt) }))
    .filter((entry) => !Number.isNaN(entry.time))
    .sort((a, b) => b.time - a.time);

  const match = entries
    .map((entry) => ({ entry, pattern: getPattern(entry.slug) }))
    .find(({ pattern }) => pattern !== undefined && pattern.status === "live");

  if (!match || !match.pattern || match.pattern.status !== "live") return undefined;
  const pattern = match.pattern;
  const bestSection = match.entry.lesson.lastSection;

  const problems = problemsForPattern(pattern.slug);
  const done = problems.filter((problem) => progress.solved[problem.slug] === true).length;
  const nextProblem = problems.find((problem) => progress.solved[problem.slug] !== true);

  return {
    pattern,
    section: bestSection,
    sectionIndex: SECTION_INDEX[bestSection],
    sectionLabel: SECTION_LABEL[bestSection],
    done,
    total: problems.length,
    nextProblem,
  };
}
