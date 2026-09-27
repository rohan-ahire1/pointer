"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { EXTRAS_KEY, type Difficulty, type Problem, type ProblemGroupSummary } from "@/content";
import { useProgress } from "@/lib/progress";
import { ProblemGroupSection } from "@/components/Problems/ProblemGroupSection/ProblemGroupSection";
import styles from "./ProblemsBrowser.module.css";

type DifficultyFilter = "all" | Difficulty;
type StatusFilter = "all" | "todo" | "done";

const DIFFICULTY_OPTIONS: { value: DifficultyFilter; label: string }[] = [
  { value: "all", label: "Any" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "done", label: "Solved" },
];

type ProblemsBrowserProps = {
  groups: ProblemGroupSummary[];
};

function lessonInfo(group: ProblemGroupSummary): { href?: string; label: string } {
  if (group.key === EXTRAS_KEY || !group.pattern) {
    return { label: "No lesson (extra)" };
  }
  return {
    href: `/patterns/${group.pattern.slug}`,
    label: group.pattern.status === "live" ? "Lesson: live" : "Lesson: coming soon",
  };
}

/**
 * The interactive body of /problems (design/mocks/C2-Problems.dc.html):
 * search + difficulty/status filters, difficulty stat tiles, and the 16
 * collapsible groups (15 patterns + Extras). Solved state comes from the
 * shared progress store, so checking a box here matches a lesson page's
 * "Mark solved" for the same problem.
 */
export function ProblemsBrowser({ groups }: ProblemsBrowserProps) {
  const { progress } = useProgress();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});

  const isFiltering = query.trim() !== "" || difficulty !== "all" || status !== "all";
  const q = query.trim().toLowerCase();

  function isSolved(slug: string): boolean {
    return progress.solved[slug] === true;
  }

  function matches(problem: Problem, groupLabel: string): boolean {
    const solved = isSolved(problem.slug);
    if (q && !problem.title.toLowerCase().includes(q) && !groupLabel.toLowerCase().includes(q)) return false;
    if (difficulty !== "all" && problem.difficulty !== difficulty) return false;
    if (status === "todo" && solved) return false;
    if (status === "done" && !solved) return false;
    return true;
  }

  const stats = useMemo(() => {
    const counts: Record<Difficulty, { done: number; total: number }> = {
      easy: { done: 0, total: 0 },
      medium: { done: 0, total: 0 },
      hard: { done: 0, total: 0 },
    };
    for (const group of groups) {
      for (const problem of group.problems) {
        counts[problem.difficulty].total += 1;
        if (isSolved(problem.slug)) counts[problem.difficulty].done += 1;
      }
    }
    return counts;
    // progress.solved is read through isSolved; groups is static per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, progress]);

  const totalProblems = groups.reduce((sum, group) => sum + group.problems.length, 0);

  const sections = groups.map((group) => {
    const { href, label } = lessonInfo(group);
    const done = group.problems.filter((p) => isSolved(p.slug)).length;
    const rows = group.problems.filter((p) => matches(p, group.label));
    const open = isFiltering ? rows.length > 0 : (openOverrides[group.key] ?? true);
    return { group, href, label, done, rows, open };
  });
  const shown = sections.reduce((sum, section) => sum + section.rows.length, 0);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.title}>The classic interview problem list, grouped by pattern.</p>
          <p className={styles.subtitle}>Tick them off as you go. Your progress stays on this device.</p>
        </div>
        <div className={styles.statsGrid}>
          <div className={`${styles.statTile} ${styles.statEasy}`}>
            <span className={styles.statLabel}>Easy</span>
            <span className={`soft ${styles.statValue}`}>
              {stats.easy.done} / {stats.easy.total}
            </span>
          </div>
          <div className={`${styles.statTile} ${styles.statMedium}`}>
            <span className={styles.statLabel}>Medium</span>
            <span className={`soft ${styles.statValue}`}>
              {stats.medium.done} / {stats.medium.total}
            </span>
          </div>
          <div className={`${styles.statTile} ${styles.statHard}`}>
            <span className={styles.statLabel}>Hard</span>
            <span className={`soft ${styles.statValue}`}>
              {stats.hard.done} / {stats.hard.total}
            </span>
          </div>
        </div>
      </header>

      <div role="search" className={styles.filterBar}>
        <label htmlFor="problems-query" className="sr-only">
          Filter problems by name
        </label>
        <div className={styles.searchField}>
          <SearchIcon />
          <input
            id="problems-query"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
            placeholder={'Filter by name, e.g. "window"'}
            autoComplete="off"
            className={styles.searchInput}
          />
        </div>
        <div role="group" aria-label="Difficulty" className={styles.segmentGroup}>
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDifficulty(option.value)}
              aria-pressed={difficulty === option.value}
              className={difficulty === option.value ? styles.segmentActive : styles.segment}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Status" className={styles.segmentGroup}>
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              aria-pressed={status === option.value}
              className={status === option.value ? styles.segmentActive : styles.segment}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span aria-live="polite" className={styles.shownLabel}>
          {shown} of {totalProblems} shown
        </span>
      </div>

      <div className={styles.groups}>
        {sections.map(({ group, href, label, done, rows, open }) =>
          isFiltering && rows.length === 0 ? null : (
            <ProblemGroupSection
              key={group.key}
              groupKey={group.key}
              label={group.label}
              number={group.pattern?.number}
              rows={rows}
              doneCount={done}
              totalCount={group.problems.length}
              open={open}
              onToggle={() =>
                setOpenOverrides((prev) => ({ ...prev, [group.key]: !(prev[group.key] ?? true) }))
              }
              lessonHref={href}
              lessonLabel={label}
            />
          ),
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}
