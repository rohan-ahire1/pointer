"use client";

import { useId, useState, type MouseEvent } from "react";
import Link from "next/link";
import { problemVisualizerHref, type Problem } from "@/content";
import { useProgress } from "@/lib/progress";
import { padPatternNumber } from "@/lib/pattern-nav";
import { dispatchShowVisualizer } from "@/lib/visualizer-events";
import { ProblemHint, ProblemHintToggle } from "@/components/Problems/ProblemHint/ProblemHint";
import styles from "./ProblemCard.module.css";

type ProblemCardProps = {
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
 * One problem card in the Solve section (design/mocks/C2-Pattern.dc.html
 * #solve): difficulty tag, twist copy, a "Mark solved" toggle shared with
 * /problems via the progress store, and a LeetCode link that announces it
 * opens a new tab. Also reused (read-only context differs) by /problems.
 */
export function ProblemCard({ problem, index }: ProblemCardProps) {
  const { isSolved, toggleSolved } = useProgress();
  const solved = isSolved(problem.slug);
  const [hintOpen, setHintOpen] = useState(false);
  const hintId = useId();
  const visualizerHref = problemVisualizerHref(problem);

  /** Stays on the page so the reader keeps their place; a modified click still opens a new tab. */
  function watchItRun(event: MouseEvent<HTMLAnchorElement>) {
    if (!problem.visualizer || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dispatchShowVisualizer(problem.visualizer);
  }

  return (
    <li className={solved ? `tilt ${styles.cardSolved}` : `tilt ${styles.card}`}>
      <div className={styles.head}>
        <span className={`${styles.diffTag} ${DIFFICULTY_CLASS[problem.difficulty]}`}>
          {DIFFICULTY_LABEL[problem.difficulty]}
        </span>
        <span className={styles.index}>{padPatternNumber(index)}</span>
      </div>
      <h3 className={`soft ${styles.title}`}>{problem.title}</h3>
      {problem.premium && <span className={styles.premium}>LeetCode Premium</span>}
      <p className={styles.twist}>{problem.twist}</p>
      <div className={styles.extras}>
        <ProblemHintToggle
          controls={hintId}
          open={hintOpen}
          title={problem.title}
          onToggle={() => setHintOpen((open) => !open)}
        />
        {visualizerHref && (
          <Link
            href={visualizerHref}
            onClick={watchItRun}
            aria-label={`Watch it run: ${problem.title}`}
            className={styles.watchLink}
          >
            <span aria-hidden="true">▶ </span>Watch it run
          </Link>
        )}
      </div>
      <ProblemHint id={hintId} problem={problem} open={hintOpen} />
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
