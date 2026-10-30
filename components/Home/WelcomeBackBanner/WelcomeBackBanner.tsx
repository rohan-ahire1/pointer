"use client";

import Link from "next/link";
import { dueReviews, localDay, useProgress } from "@/lib/progress";
import { getContinueLesson } from "@/lib/continue-lesson";
import { padPatternNumber } from "@/lib/pattern-nav";
import styles from "./WelcomeBackBanner.module.css";

/**
 * The "WELCOME BACK" strip (design/mocks/C2-Home.dc.html) — only when
 * progress exists. `useProgress`'s server snapshot is always the empty
 * shape (lib/progress/store.ts), so this renders nothing on the server and
 * on the client's first render too: no hydration mismatch, just a banner
 * that quietly appears once the real localStorage value loads.
 */
export function WelcomeBackBanner() {
  const { progress } = useProgress();
  const continueLesson = getContinueLesson(progress);
  const due = dueReviews(progress, localDay()).length;
  const pct = continueLesson && continueLesson.total > 0 ? Math.round((continueLesson.done / continueLesson.total) * 100) : 0;

  return (
    <>
      {continueLesson && (
        <Link href={`/patterns/${continueLesson.pattern.slug}#${continueLesson.section}`} className={styles.banner}>
          <span className={styles.eyebrow}>WELCOME BACK</span>
          <span className={styles.copy}>
            Continue <b>{padPatternNumber(continueLesson.pattern.number)} {continueLesson.pattern.name}</b>. You stopped at{" "}
            <b>{continueLesson.sectionIndex} · {continueLesson.sectionLabel}</b>, with {continueLesson.done} of{" "}
            {continueLesson.total} problems solved.
          </span>
          <span aria-hidden="true" className={styles.progressTrack}>
            <span className={styles.progressFill} style={{ width: `${pct}%` }} />
          </span>
          <span className={styles.resume}>Resume →</span>
        </Link>
      )}
      {/* Problems ticked on /problems come due even if no lesson was opened. */}
      {due > 0 && (
        <Link href="/progress#review" className={styles.dueLink}>
          {due === 1 ? "1 problem" : `${due} problems`} due for review →
        </Link>
      )}
    </>
  );
}
