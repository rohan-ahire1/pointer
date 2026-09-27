"use client";

import Link from "next/link";
import { getProblems } from "@/content";
import { useProgress } from "@/lib/progress";
import styles from "./YourProgressCard.module.css";

const allProblems = getProblems();

/** The small "YOUR PROGRESS" card in /patterns' header (design/mocks/C2-Patterns.dc.html). */
export function YourProgressCard() {
  const { progress } = useProgress();
  const done = allProblems.filter((problem) => progress.solved[problem.slug] === true).length;
  const total = allProblems.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className={styles.card}>
      <span className={styles.label}>YOUR PROGRESS</span>
      <span className={`soft ${styles.value}`}>
        {done} <span className={styles.of}>of {total} solved</span>
      </span>
      <div
        role="progressbar"
        aria-label="Problems solved"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className={styles.track}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <Link href="/progress" className={styles.link}>
        See your progress →
      </Link>
    </div>
  );
}
