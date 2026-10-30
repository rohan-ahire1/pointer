import type { ReactNode } from "react";
import { getPattern, type Problem } from "@/content";
import styles from "./ProblemHint.module.css";

type ProblemHintToggleProps = {
  /** The id of the `ProblemHint` this opens. */
  controls: string;
  open: boolean;
  title: string;
  onToggle: () => void;
};

/** The button half of a hint. Kept apart because each host puts it somewhere different. */
export function ProblemHintToggle({ controls, open, title, onToggle }: ProblemHintToggleProps) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={`Hint for ${title}`}
      onClick={onToggle}
      className={styles.toggle}
    >
      <span aria-hidden="true" className={open ? styles.chevronOpen : styles.chevron}>
        ▸
      </span>
      Hint
    </button>
  );
}

type ProblemHintProps = {
  id: string;
  problem: Problem;
  open: boolean;
  className?: string;
  /** Anything else worth doing from here, such as a link to its visualizer. */
  children?: ReactNode;
};

/**
 * What gives a problem away, for when you're stuck: the clue, the Big-O to aim
 * for and any other pattern that fairly solves it. Stays in the DOM while
 * closed so the toggle's `aria-controls` always points at something.
 */
export function ProblemHint({ id, problem, open, className, children }: ProblemHintProps) {
  const alsoFits = (problem.alsoFits ?? []).flatMap((slug) => getPattern(slug)?.name ?? []);

  return (
    <div id={id} hidden={!open} className={className ? `${styles.hint} ${className}` : styles.hint}>
      <p className={styles.signal}>{problem.signal}</p>
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>Time</dt>
          <dd>{problem.time}</dd>
        </div>
        <div className={styles.fact}>
          <dt>Space</dt>
          <dd>{problem.space}</dd>
        </div>
      </dl>
      {alsoFits.length > 0 && <p className={styles.also}>Also works with {alsoFits.join(" or ")}.</p>}
      {children}
    </div>
  );
}
