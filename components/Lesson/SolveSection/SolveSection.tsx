"use client";

import Link from "next/link";
import type { LessonSection, Problem } from "@/content";
import type { PatternGuide } from "@/content/guides";
import type { Solution } from "@/content/solutions";
import { useProgress } from "@/lib/progress";
import { PatternTemplate } from "@/components/Lesson/PatternTemplate/PatternTemplate";
import { ProblemCard } from "@/components/Lesson/ProblemCard/ProblemCard";
import styles from "./SolveSection.module.css";

type SolveSectionProps = {
  problems: Problem[];
  patternName: string;
  guide?: PatternGuide;
  /** Subheadings that split the problems into groups, in order. Without them it's one grid. */
  sections?: LessonSection[];
  /** Worked solutions by problem slug, for the problems that have one. */
  solutions?: Record<string, Solution>;
};

/** The Solve section (design/mocks/C2-Pattern.dc.html #solve): progress bar, a template to start from and problem cards. */
export function SolveSection({ problems, patternName, guide, sections, solutions = {} }: SolveSectionProps) {
  const { progress } = useProgress();
  const done = problems.filter((p) => progress.solved[p.slug]).length;
  const pct = problems.length > 0 ? Math.round((done / problems.length) * 100) : 0;
  const complete = problems.length > 0 && done === problems.length;
  const position = new Map(problems.map((problem, index) => [problem.slug, index + 1] as const));
  const bySlug = new Map(problems.map((problem) => [problem.slug, problem] as const));
  const groups = sections?.length
    ? sections.map((section) => ({
        section,
        problems: section.problems.flatMap((slug) => bySlug.get(slug) ?? []),
      }))
    : [{ section: undefined, problems }];

  return (
    <section id="solve" aria-labelledby="solve-h" className={styles.section}>
      <div className={styles.head}>
        <h2 id="solve-h" className={`soft ${styles.heading}`}>
          <span className={styles.headingIndex}>4 · </span>Your turn
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
      {guide && <PatternTemplate guide={guide} patternName={patternName} />}
      {groups.map(({ section, problems: shown }) => (
        <div key={section?.title ?? "all"} className={styles.group}>
          {section && (
            <div className={styles.groupHead}>
              <h3 className={`soft ${styles.groupTitle}`}>{section.title}</h3>
              <p className={styles.groupNote}>{section.note}</p>
            </div>
          )}
          <ol className={styles.grid} start={position.get(shown[0]?.slug ?? "")}>
            {shown.map((problem) => (
              <ProblemCard
                key={problem.slug}
                problem={problem}
                index={position.get(problem.slug) ?? 0}
                solution={solutions[problem.slug]}
              />
            ))}
          </ol>
        </div>
      ))}
      {/* Always mounted, so screen readers announce it when the last problem is ticked. */}
      <div role="status" className={styles.status}>
        {complete && (
          <p className={styles.complete}>
            <span aria-hidden="true">✓ </span>All {problems.length} solved. They&apos;ll come back in your{" "}
            <Link href="/progress#review">review queue</Link> so they stick.
          </p>
        )}
      </div>
    </section>
  );
}
