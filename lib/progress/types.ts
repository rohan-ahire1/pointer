/**
 * Progress storage model — CLAUDE.md §Progress (localStorage), key
 * `pointer:v1`. Kept dependency-free (no React) so it can be validated and
 * unit tested in isolation from the store that persists it.
 */

/** The four numbered sections of a live lesson page. */
export type LessonSection = "idea" | "watch" | "try" | "solve";

export type LessonProgress = {
  lastSection: LessonSection;
  /** ISO 8601 timestamp, e.g. `new Date().toISOString()`. */
  updatedAt: string;
};

/** Where a solved problem sits in the spaced review (see review.ts). */
export type ReviewCard = {
  /** Index into REVIEW_INTERVALS. */
  box: number;
  /** Local day it comes back, `YYYY-MM-DD`. */
  due: string;
};

export type Progress = {
  version: 1;
  /** Keyed by `Problem["slug"]`; presence (always `true`) means solved. */
  solved: Record<string, true>;
  /** Keyed by `Pattern["slug"]`. */
  lessons: Record<string, LessonProgress>;
  /** Keyed by `Problem["slug"]`. Added after launch, so older exports don't have it. */
  reviews?: Record<string, ReviewCard>;
  /** Practice actions per local day, `YYYY-MM-DD`. */
  activity?: Record<string, number>;
  /** Best score out of 10 on the pattern drill. */
  drillBest?: number;
};

/** The value used for both the very first run and every server render. */
export const EMPTY_PROGRESS: Progress = {
  version: 1,
  solved: {},
  lessons: {},
};

export const PROGRESS_STORAGE_KEY = "pointer:v1";

const LESSON_SECTIONS: readonly LessonSection[] = ["idea", "watch", "try", "solve"];

export function isLessonSection(value: unknown): value is LessonSection {
  return typeof value === "string" && (LESSON_SECTIONS as readonly string[]).includes(value);
}

/** Result of `importProgress` — a discriminated union so callers must check `ok`. */
export type ImportResult = { ok: true } | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDay(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Strict structural validation for imported/stored JSON. Every field is
 * checked; anything unexpected is rejected with a human-readable reason
 * rather than silently coerced, so a corrupt or hand-edited export fails
 * loudly instead of poisoning the merge.
 */
export function validateProgress(value: unknown): { ok: true; value: Progress } | { ok: false; error: string } {
  if (!isPlainObject(value)) {
    return { ok: false, error: "Expected a JSON object." };
  }
  if (value.version !== 1) {
    return { ok: false, error: `Unsupported version: expected 1, got ${JSON.stringify(value.version)}.` };
  }
  if (!isPlainObject(value.solved)) {
    return { ok: false, error: "\"solved\" must be an object." };
  }
  for (const [slug, solved] of Object.entries(value.solved)) {
    if (solved !== true) {
      return { ok: false, error: `"solved.${slug}" must be true, got ${JSON.stringify(solved)}.` };
    }
  }
  if (!isPlainObject(value.lessons)) {
    return { ok: false, error: "\"lessons\" must be an object." };
  }
  for (const [slug, lesson] of Object.entries(value.lessons)) {
    if (!isPlainObject(lesson)) {
      return { ok: false, error: `"lessons.${slug}" must be an object.` };
    }
    if (!isLessonSection(lesson.lastSection)) {
      return {
        ok: false,
        error: `"lessons.${slug}.lastSection" must be one of idea/watch/try/solve, got ${JSON.stringify(lesson.lastSection)}.`,
      };
    }
    if (typeof lesson.updatedAt !== "string" || Number.isNaN(Date.parse(lesson.updatedAt))) {
      return { ok: false, error: `"lessons.${slug}.updatedAt" must be an ISO date string.` };
    }
  }

  if (value.reviews !== undefined) {
    if (!isPlainObject(value.reviews)) {
      return { ok: false, error: "\"reviews\" must be an object." };
    }
    for (const [slug, card] of Object.entries(value.reviews)) {
      if (!isPlainObject(card) || !Number.isInteger(card.box) || (card.box as number) < 0 || !isDay(card.due)) {
        return { ok: false, error: `"reviews.${slug}" must have a whole box number and a YYYY-MM-DD due date.` };
      }
    }
  }
  if (value.activity !== undefined) {
    if (!isPlainObject(value.activity)) {
      return { ok: false, error: "\"activity\" must be an object." };
    }
    for (const [day, count] of Object.entries(value.activity)) {
      if (!isDay(day) || !Number.isInteger(count) || (count as number) < 1) {
        return { ok: false, error: `"activity.${day}" must be a YYYY-MM-DD day with a whole count.` };
      }
    }
  }
  if (value.drillBest !== undefined) {
    if (!Number.isInteger(value.drillBest) || (value.drillBest as number) < 0) {
      return { ok: false, error: "\"drillBest\" must be a whole number." };
    }
  }

  const progress: Progress = {
    version: 1,
    solved: { ...(value.solved as Record<string, true>) },
    lessons: { ...(value.lessons as Record<string, LessonProgress>) },
  };
  if (value.reviews !== undefined) progress.reviews = { ...(value.reviews as Record<string, ReviewCard>) };
  if (value.activity !== undefined) progress.activity = { ...(value.activity as Record<string, number>) };
  if (value.drillBest !== undefined) progress.drillBest = value.drillBest as number;
  return { ok: true, value: progress };
}

/**
 * Merges `incoming` into `base`: solved problems are unioned (once solved,
 * always solved through a merge), and per-pattern lesson progress keeps
 * whichever side is more recent by `updatedAt`. For reviews the card from the
 * further-along box wins, activity keeps the higher count for a day, and the
 * better drill score stays.
 */
export function mergeProgress(base: Progress, incoming: Progress): Progress {
  const solved: Record<string, true> = { ...base.solved, ...incoming.solved };

  const lessons: Record<string, LessonProgress> = { ...base.lessons };
  for (const [slug, lesson] of Object.entries(incoming.lessons)) {
    const existing = lessons[slug];
    if (!existing || Date.parse(lesson.updatedAt) >= Date.parse(existing.updatedAt)) {
      lessons[slug] = lesson;
    }
  }

  const merged: Progress = { version: 1, solved, lessons };

  if (base.reviews || incoming.reviews) {
    const reviews: Record<string, ReviewCard> = { ...base.reviews };
    for (const [slug, card] of Object.entries(incoming.reviews ?? {})) {
      const existing = reviews[slug];
      if (!existing || card.box > existing.box || (card.box === existing.box && card.due > existing.due)) {
        reviews[slug] = card;
      }
    }
    merged.reviews = reviews;
  }

  if (base.activity || incoming.activity) {
    const activity: Record<string, number> = { ...base.activity };
    for (const [day, count] of Object.entries(incoming.activity ?? {})) {
      activity[day] = Math.max(activity[day] ?? 0, count);
    }
    merged.activity = activity;
  }

  if (base.drillBest !== undefined || incoming.drillBest !== undefined) {
    merged.drillBest = Math.max(base.drillBest ?? 0, incoming.drillBest ?? 0);
  }

  return merged;
}
