"use client";

import { useId } from "react";
import Link from "next/link";
import type { Problem } from "@/content";
import { useProgress } from "@/lib/progress";
import styles from "./ProblemRow.module.css";

type ProblemRowProps = {
  problem: Problem;
  lessonHref?: string;
  lessonLabel: string;
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
 * One row in a /problems group (design/mocks/C2-Problems.dc.html): a real
 * checkbox (shared solved-state with the lesson page's "Mark solved" via
 * the progress store), the title, difficulty, a link to the pattern lesson
 * (or "no lesson" for an Extras problem) and the LeetCode link.
 */
export function ProblemRow({ problem, lessonHref, lessonLabel }: ProblemRowProps) {
  const { isSolved, toggleSolved } = useProgress();
  const solved = isSolved(problem.slug);
  const checkboxId = useId();

  return (
    <li className={styles.row}>
      {/* The checkbox glyph is small, but it's wrapped in a 44x44 label so
          the tappable area meets the 44px touch-target rule (CLAUDE.md) —
          the visible name label below is a second, larger way to toggle
          the same input via its own `htmlFor`. */}
      <label htmlFor={checkboxId} className={styles.checkboxWrap}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={solved}
          onChange={() => toggleSolved(problem.slug)}
          aria-label={`${solved ? "Mark not solved" : "Mark solved"}: ${problem.title}`}
          className={styles.checkbox}
        />
      </label>
      <label htmlFor={checkboxId} className={solved ? styles.nameSolved : styles.name}>
        {problem.title}
      </label>
      <span className={`${styles.diffTag} ${DIFFICULTY_CLASS[problem.difficulty]}`}>
        {DIFFICULTY_LABEL[problem.difficulty]}
      </span>
      {lessonHref ? (
        <Link href={lessonHref} className={styles.lessonLink}>
          {lessonLabel}
        </Link>
      ) : (
        <span className={styles.lessonLink}>{lessonLabel}</span>
      )}
      <a
        href={problem.leetcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${problem.title} on LeetCode (opens in a new tab)`}
        className={styles.leetcodeLink}
      >
        <span aria-hidden="true">LeetCode ↗</span>
      </a>
    </li>
  );
}
