import type { ReactNode } from "react";
import type { CellState } from "./Cell";
import styles from "./Panel.module.css";

type PanelProps = {
  title: string;
  /** Right-aligned content in the header, e.g. a probe chip. */
  aside?: ReactNode;
  /** Tinted header band (heaps use lilac / mint). */
  tone?: "plain" | "lilac" | "mint";
  children: ReactNode;
};

/** A titled box beside or under the main picture: the hash map, the queue, the call stack. */
export function Panel({ title, aside, tone = "plain", children }: PanelProps) {
  return (
    <div className={styles.panel} data-tone={tone}>
      <div className={`${styles.head} ${styles.headBand}`}>
        <span className={styles.title}>{title}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

/** A chip row that keeps its height when empty. */
export function Chips({ children, empty }: { children: ReactNode; empty?: string }) {
  const isEmpty = Array.isArray(children) ? children.length === 0 : !children;
  return <div className={styles.chips}>{isEmpty && empty ? <span className={styles.empty}>{empty}</span> : children}</div>;
}

/** A small mono chip (map entry, queue cell, result). New chips scale in. */
export function Chip({ children, state = "waiting" }: { children: ReactNode; state?: CellState }) {
  return (
    <span className={styles.chip} data-state={state}>
      {children}
    </span>
  );
}
