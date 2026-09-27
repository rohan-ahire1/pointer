import type { CSSProperties, ReactNode } from "react";
import styles from "./ViewRoot.module.css";

/**
 * Outer wrapper for every view: sets the responsive `--cell` / `--cell-gap`
 * sizes the kit components read, and hides the picture from screen readers
 * (the player announces each step's `sr` text instead).
 */
export function ViewRoot({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={styles.root} style={style} aria-hidden="true">
      {children}
    </div>
  );
}

/** Two areas side by side on wide screens (e.g. strip + map panel), stacked otherwise. */
export function Split({ children }: { children: ReactNode }) {
  return <div className={styles.split}>{children}</div>;
}
