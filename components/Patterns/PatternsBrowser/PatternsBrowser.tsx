"use client";

import { useState } from "react";
import Link from "next/link";
import type { PatternGroupSummary } from "@/content";
import { useProgress } from "@/lib/progress";
import { isPatternStarted, solvedCountForPattern } from "@/lib/pattern-progress";
import { PatternCard } from "@/components/PatternCard/PatternCard";
import styles from "./PatternsBrowser.module.css";

type StatusFilter = "all" | "live" | "started";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live now" },
  { value: "started", label: "Started" },
];

type PatternsBrowserProps = {
  groups: PatternGroupSummary[];
  extrasCount: number;
};

/**
 * The filterable body of /patterns (design/mocks/C2-Patterns.dc.html):
 * Foundations / Structures & Recursion / Advanced groups, each pattern's
 * card showing its own solved-problem count, and an All / Live now /
 * Started filter. "Started" = has lesson progress or a solved problem
 * (lib/pattern-progress.ts's isPatternStarted) — text-labelled, not just a
 * colour swap, on every card either way.
 */
export function PatternsBrowser({ groups, extrasCount }: PatternsBrowserProps) {
  const { progress } = useProgress();
  const [filter, setFilter] = useState<StatusFilter>("all");

  function matches(pattern: PatternGroupSummary["patterns"][number]): boolean {
    if (filter === "live") return pattern.status === "live";
    if (filter === "started") return isPatternStarted(pattern, progress);
    return true;
  }

  const sections = groups.map((group) => {
    const patterns = group.patterns.filter(matches);
    const groupSolved = group.patterns.reduce(
      (sum, pattern) => sum + solvedCountForPattern(pattern, progress).done,
      0,
    );
    const groupTotal = group.patterns.reduce(
      (sum, pattern) => sum + solvedCountForPattern(pattern, progress).total,
      0,
    );
    return { group, patterns, groupSolved, groupTotal };
  });
  const shownCount = sections.reduce((sum, section) => sum + section.patterns.length, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.filterBar}>
        <span id="pattern-filter-label" className={styles.filterLabel}>
          Show
        </span>
        <div role="group" aria-labelledby="pattern-filter-label" className={styles.filterGroup}>
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={filter === option.value ? styles.filterButtonActive : styles.filterButton}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span aria-live="polite" className={styles.countLabel}>
          {shownCount} {shownCount === 1 ? "pattern" : "patterns"}
        </span>
      </div>

      {sections.map(
        ({ group, patterns, groupSolved, groupTotal }) =>
          patterns.length > 0 && (
            <section key={group.key} aria-labelledby={`group-${group.key}`} className={styles.group}>
              <div className={styles.groupHead}>
                <h2 id={`group-${group.key}`} className={styles.groupTitle}>
                  {group.label.toUpperCase()}
                </h2>
                <span className={styles.groupBlurb}>{group.description}</span>
                <span className={styles.groupSummary}>
                  {groupSolved} / {groupTotal} solved
                </span>
              </div>
              <ul className={styles.grid}>
                {patterns.map((pattern) => {
                  const { done, total } = solvedCountForPattern(pattern, progress);
                  return (
                    <li key={pattern.slug}>
                      <PatternCard pattern={pattern} variant="full" solved={done} total={total} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ),
      )}

      {extrasCount > 0 && (
        <Link href="/problems" className={styles.extrasCallout}>
          <span className={styles.extrasTag}>+{extrasCount} EXTRAS</span>
          <span>Math, bit tricks and one advanced graph problem finish the Blind 75. They live on the problems page.</span>
          <span className={styles.extrasLink}>Open →</span>
        </Link>
      )}
    </div>
  );
}
