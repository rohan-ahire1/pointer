"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getProblem } from "@/content";
import { dueReviews, localDay, REVIEW_INTERVALS, useProgress } from "@/lib/progress";
import { ProblemHint, ProblemHintToggle } from "@/components/Problems/ProblemHint/ProblemHint";
import styles from "./ReviewQueue.module.css";

/** How many waiting problems to name under the card before just counting them. */
const NAMED_AHEAD = 3;

function formatDay(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function inDays(days: number): string {
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

/**
 * Solved problems come back on a widening schedule, so they stick. One card at
 * a time: the buttons stay mounted between cards, which keeps keyboard focus
 * in place for working down the queue. Renders nothing on the server (the
 * server progress snapshot is empty), so `localDay()` can't cause a mismatch.
 */
export function ReviewQueue() {
  const { progress, reviewProblem } = useProgress();
  const [hintFor, setHintFor] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const hasSolved = Object.keys(progress.solved).length > 0;

  // The section only exists after hydration, too late for the browser's own jump to #review.
  useEffect(() => {
    if (hasSolved && window.location.hash === "#review") sectionRef.current?.scrollIntoView();
  }, [hasSolved]);

  if (!hasSolved) return null;

  const today = localDay();
  const due = dueReviews(progress, today).flatMap((slug) => getProblem(slug) ?? []);
  const [current, ...waiting] = due;

  function review(remembered: boolean) {
    if (!current) return;
    // The last card's buttons are about to go, so give focus somewhere that stays.
    if (due.length === 1) headingRef.current?.focus();
    reviewProblem(current.slug, remembered);
  }

  const nextDue = Object.values(progress.reviews ?? {})
    .map((card) => card.due)
    .sort()[0];

  const box = current ? progress.reviews?.[current.slug]?.box : undefined;
  const gotItDays = REVIEW_INTERVALS[Math.min((box ?? -1) + 1, REVIEW_INTERVALS.length - 1)];

  return (
    <section ref={sectionRef} id="review" aria-labelledby="review-h" className={styles.section}>
      <div className={styles.head}>
        <h2 ref={headingRef} id="review-h" tabIndex={-1} className={`soft ${styles.heading}`}>
          Review
        </h2>
        <span className={styles.count}>{due.length} due</span>
      </div>

      {current ? (
        <div className={styles.card}>
          <div key={current.slug} className={styles.cardBody}>
            <p className={styles.eyebrow}>Could you still solve this?</p>
            <h3 className={`soft ${styles.title}`}>{current.title}</h3>
            <p className={styles.prompt}>{current.prompt}</p>
          </div>
          <ProblemHintToggle
            controls="review-hint"
            open={hintFor === current.slug}
            title={current.title}
            onToggle={() => setHintFor(hintFor === current.slug ? null : current.slug)}
          />
          <ProblemHint id="review-hint" problem={current} open={hintFor === current.slug} />
          <div className={styles.actions}>
            <button type="button" onClick={() => review(true)} className={styles.gotIt}>
              Got it, ask me {inDays(gotItDays)}
            </button>
            <button type="button" onClick={() => review(false)} className={styles.notYet}>
              Not yet, ask me tomorrow
            </button>
            <a
              href={current.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Try ${current.title} on LeetCode (opens in a new tab)`}
              className={styles.leetcodeLink}
            >
              <span aria-hidden="true">Try it on LeetCode ↗</span>
            </a>
          </div>
          {waiting.length > 0 && (
            <p className={styles.waiting}>
              Then {waiting.slice(0, NAMED_AHEAD).map((problem) => problem.title).join(", ")}
              {waiting.length > NAMED_AHEAD && ` and ${waiting.length - NAMED_AHEAD} more`}.
            </p>
          )}
        </div>
      ) : (
        <div role="status" className={styles.done}>
          <p className={styles.doneTitle}>
            <span aria-hidden="true">✓ </span>Nothing due today.
          </p>
          <p className={styles.doneBody}>
            {nextDue ? `Next review ${formatDay(nextDue)}. ` : ""}
            <Link href="/drill">Run a pattern drill</Link> if you want more practice.
          </p>
        </div>
      )}
    </section>
  );
}
