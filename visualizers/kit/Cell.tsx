import type { ReactNode } from "react";
import styles from "./Cell.module.css";

/**
 * Cell states (docs/patterns/README.md, section 1):
 * - waiting: card, solid border — the default.
 * - current: the one thing the code is looking at; orange, lifted.
 * - range: inside the live search space when no capsule is drawn; tint-yellow.
 * - done / found: finished or part of the answer; mint. `found` shows a ✓ badge by default.
 * - past: ruled out or left behind; dashed border, faint text.
 */
export type CellState = "waiting" | "current" | "range" | "done" | "found" | "past";

type CellProps = {
  value: ReactNode;
  state?: CellState;
  /** Small corner badge (a glyph or number) — the non-colour signal for a state. */
  badge?: ReactNode;
  size?: "md" | "sm";
};

export function Cell({ value, state = "waiting", badge, size = "md" }: CellProps) {
  const shownBadge = badge ?? (state === "found" ? "✓" : undefined);
  return (
    <div className={styles.cell} data-state={state} data-size={size}>
      {value}
      {shownBadge !== undefined && <span className={styles.badge}>{shownBadge}</span>}
    </div>
  );
}
