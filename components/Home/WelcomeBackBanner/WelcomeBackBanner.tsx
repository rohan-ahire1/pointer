"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
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
  if (!continueLesson) return null;

  const { pattern, sectionLabel, sectionIndex, done, total } = continueLesson;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link href={`/patterns/${pattern.slug}#${continueLesson.section}`} className={styles.banner}>
      <span className={styles.eyebrow}>WELCOME BACK</span>
      <span className={styles.copy}>
        Continue <b>{padPatternNumber(pattern.number)} {pattern.name}</b>. You stopped at{" "}
        <b>{sectionIndex} · {sectionLabel}</b>, with {done} of {total} problems solved.
      </span>
      <span aria-hidden="true" className={styles.progressTrack}>
        <span className={styles.progressFill} style={{ width: `${pct}%` }} />
      </span>
      <span className={styles.resume}>Resume →</span>
    </Link>
  );
}
