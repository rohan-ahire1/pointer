"use client";

import type { Problem } from "@/content";
import { useProgress } from "@/lib/progress";
import { LessonProblemRow } from "@/components/Lesson/LessonProblemRow/LessonProblemRow";
import styles from "./SolveSection.module.css";

type SolveSectionProps = {
  problems: Problem[];
};

/** The Solve section (design/mocks/C2-Pattern.dc.html #solve): progress bar + a compact list of problem rows. */
export function SolveSection({ problems }: SolveSectionProps) {
  const { progress } = useProgress();
  const done = problems.filter((p) => progress.solved[p.slug]).length;
  const pct = problems.length > 0 ? Math.round((done / problems.length) * 100) : 0;

  return (
    <section id="solve" aria-labelledby="solve-h" className={styles.section}>
      <div className={styles.head}>
        <h2 id="solve-h" className={`soft ${styles.heading}`}>
          <span className={styles.headingIndex}>4 · </span>Practice problems
        </h2>
        <div className={styles.progressWrap}>
          <span id="solve-progress-label" className={styles.progressLabel}>
            {done} of {problems.length} problems solved
          </span>
          <div
            role="progressbar"
            aria-labelledby="solve-progress-label"
            aria-valuemin={0}
            aria-valuemax={problems.length}
            aria-valuenow={done}
            className={styles.progressTrack}
          >
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      <ol className={styles.list}>
        {problems.map((problem, index) => (
          <LessonProblemRow key={problem.slug} problem={problem} index={index + 1} />
        ))}
      </ol>
    </section>
  );
}
