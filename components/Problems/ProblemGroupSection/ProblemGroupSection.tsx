"use client";

import type { Problem } from "@/content";
import { padPatternNumber } from "@/lib/pattern-nav";
import { ProblemRow } from "@/components/Problems/ProblemRow/ProblemRow";
import styles from "./ProblemGroupSection.module.css";

type ProblemGroupSectionProps = {
  groupKey: string;
  label: string;
  /** 1-indexed lesson number, or `undefined` for the Extras group (shown as "+"). */
  number?: number;
  rows: Problem[];
  doneCount: number;
  totalCount: number;
  open: boolean;
  onToggle: () => void;
  lessonHref?: string;
  lessonLabel: string;
};

/** One collapsible pattern group on /problems (design/mocks/C2-Problems.dc.html). */
export function ProblemGroupSection({
  groupKey,
  label,
  number,
  rows,
  doneCount,
  totalCount,
  open,
  onToggle,
  lessonHref,
  lessonLabel,
}: ProblemGroupSectionProps) {
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const panelId = `problem-group-${groupKey}`;

  return (
    <section className={styles.section}>
      <h2 className={styles.headingWrap}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className={open ? styles.headerOpen : styles.header}
        >
          <span className={styles.chip}>{number !== undefined ? padPatternNumber(number) : "+"}</span>
          <span className={styles.label}>{label}</span>
          <span className={styles.summary}>
            {doneCount} of {totalCount} solved
          </span>
          <span aria-hidden="true" className={styles.track}>
            <span className={styles.fill} style={{ width: `${pct}%` }} />
          </span>
          <span aria-hidden="true" className={styles.caret}>
            {open ? "−" : "+"}
          </span>
        </button>
      </h2>
      {open && (
        <ul id={panelId} className={styles.list}>
          {rows.length > 0 ? (
            rows.map((problem) => (
              <ProblemRow key={problem.slug} problem={problem} lessonHref={lessonHref} lessonLabel={lessonLabel} />
            ))
          ) : (
            <li className={styles.empty}>No problems match the current filters.</li>
          )}
        </ul>
      )}
    </section>
  );
}
