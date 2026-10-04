"use client";

import type { Problem } from "@/content";
import { useProgress } from "@/lib/progress";
import { padPatternNumber } from "@/lib/pattern-nav";
import styles from "./LessonProblemRow.module.css";

type LessonProblemRowProps = {
  problem: Problem;
  /** 1-indexed position within the pattern's problem list, for the "01" badge. */
  index: number;
};

const DIFFICULTY_LABEL: Record<Problem["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const DIFFICULTY_CLASS: Record<Problem["difficulty"], string> = {
  easy: styles.diffEasy,
  medium: styles.diffMedium,
  hard: styles.diffHard,
};

/**
 * One row in the lesson's "Practice problems" list, styled to match
 * /problems' ProblemRow: number, title (struck through once solved), twist,
 * difficulty tag, a "Mark solved" toggle shared with /problems via the
 * progress store, and a LeetCode link that announces it opens a new tab.
 */
export function LessonProblemRow({ problem, index }: LessonProblemRowProps) {
  const { isSolved, toggleSolved } = useProgress();
  const solved = isSolved(problem.slug);

  return (
    <li className={solved ? styles.rowSolved : styles.row}>
      <span className={styles.index}>{padPatternNumber(index)}</span>
      <h3 className={solved ? styles.titleSolved : styles.title}>{problem.title}</h3>
      <p className={styles.twist}>
        {problem.premium && <span className={styles.premium}>LeetCode Premium</span>}
        {problem.twist}
      </p>
      <span className={`${styles.diffTag} ${DIFFICULTY_CLASS[problem.difficulty]}`}>
        {DIFFICULTY_LABEL[problem.difficulty]}
      </span>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => toggleSolved(problem.slug)}
          aria-pressed={solved}
          aria-label={`${solved ? "Mark not solved" : "Mark solved"}: ${problem.title}`}
          className={styles.markButton}
        >
          <span aria-hidden="true" className={solved ? styles.checkboxOn : styles.checkbox}>
            {solved ? "✓" : ""}
          </span>
          {solved ? "Solved" : "Mark solved"}
        </button>
        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${problem.title} on LeetCode (opens in a new tab)`}
          className={styles.leetcodeLink}
        >
          <span aria-hidden="true">Open on LeetCode ↗</span>
        </a>
      </div>
    </li>
  );
}
