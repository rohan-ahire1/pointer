/**
 * Spaced review: a Leitner box per solved problem. Remembering moves a problem
 * up a box and pushes it further out; forgetting drops it back to tomorrow.
 * Days are local `YYYY-MM-DD` strings so "due today" follows the reader's own
 * calendar rather than UTC. Pure, so it can be tested with fixed dates.
 */
import type { Progress, ReviewCard } from "./types";

/** Days until the next review for each box. */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60] as const;

/** Days of activity kept. Streaks can only count this far back. */
export const ACTIVITY_DAYS_KEPT = 400;

export function localDay(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(day: string, days: number): string {
  const [year, month, date] = day.split("-").map(Number);
  return localDay(new Date(year, month - 1, date + days));
}

/** The first review of a problem just solved. */
export function newCard(today: string): ReviewCard {
  return { box: 0, due: addDays(today, REVIEW_INTERVALS[0]) };
}

export function nextCard(card: ReviewCard | undefined, remembered: boolean, today: string): ReviewCard {
  const box = remembered ? Math.min((card?.box ?? -1) + 1, REVIEW_INTERVALS.length - 1) : 0;
  return { box, due: addDays(today, REVIEW_INTERVALS[box]) };
}

/**
 * Solved problems waiting for a review, oldest first. Problems solved before
 * reviews existed have no card yet, so they count as due straight away.
 */
export function dueReviews(progress: Progress, today: string): string[] {
  const reviews = progress.reviews ?? {};
  return Object.keys(progress.solved)
    .filter((slug) => {
      const card = reviews[slug];
      return !card || card.due <= today;
    })
    .sort((a, b) => (reviews[a]?.due ?? "").localeCompare(reviews[b]?.due ?? ""));
}

/** Days in a row with some practice. Today not done yet doesn't break the run. */
export function currentStreak(activity: Record<string, number> | undefined, today: string): number {
  if (!activity) return 0;
  let day = activity[today] ? today : addDays(today, -1);
  let streak = 0;
  while (activity[day]) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

/** Counts one bit of practice today and forgets days nothing can show any more. */
export function bumpActivity(activity: Record<string, number> | undefined, today: string): Record<string, number> {
  const oldest = addDays(today, -ACTIVITY_DAYS_KEPT);
  const next: Record<string, number> = {};
  for (const [day, count] of Object.entries(activity ?? {})) {
    if (day >= oldest) next[day] = count;
  }
  next[today] = (next[today] ?? 0) + 1;
  return next;
}
