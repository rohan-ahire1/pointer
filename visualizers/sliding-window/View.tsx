import type { CSSProperties } from "react";
import type { Step } from "../types";
import type { SWState } from "./trace";
import styles from "./View.module.css";

type SlidingWindowViewProps = {
  step: Step<SWState>;
  input: string;
};

type CellState = "waiting" | "in-window" | "incoming" | "left-behind";

/** Matches --sw-cell-w / --sw-cell-gap in View.module.css — kept in sync so the capsule's pixel math lines up with the cells' CSS widths. */
const CELL_WIDTH = 56;
const CELL_GAP = 8;

/**
 * Cell states (design/visualizer-spec.md):
 * - waiting: card background, solid border (the default look).
 * - in window: no distinct cell background — it's the yellow capsule drawn
 *   behind the row, spanning l..r (or l..r-1 when `incl` is false), that
 *   shows this.
 * - incoming (r, not yet included): orange fill, --on-accent text, lifted.
 * - left behind (index < l): --past-bg fill, dashed --past-line border,
 *   --faint text.
 */
export function SlidingWindowView({ step }: SlidingWindowViewProps) {
  const { s, l, r, incl, seen, best } = step.state;
  const chars = s.split("");

  const windowEndExclusive = incl ? r + 1 : r;
  const windowLength = r >= 0 ? Math.max(0, windowEndExclusive - l) : 0;
  const windowText = r >= 0 ? s.slice(l, Math.max(l, windowEndExclusive)) : "";
  const showCapsule = windowLength > 0;
  const capsuleStyle: CSSProperties = {
    left: l * (CELL_WIDTH + CELL_GAP),
    width: windowLength * (CELL_WIDTH + CELL_GAP) - CELL_GAP,
  };

  return (
    <div className={styles.root}>
      <div className={styles.row} aria-hidden="true">
        {showCapsule && <div className={styles.capsule} style={capsuleStyle} />}
        {chars.map((ch, idx) => {
          const isIncoming = idx === r && !incl;
          const isPast = idx < l && r >= 0;
          const isL = r >= 0 && idx === l;
          const isR = idx === r;
          const state: CellState = isIncoming
            ? "incoming"
            : isPast
              ? "left-behind"
              : idx <= r
                ? "in-window"
                : "waiting";
          return (
            <div key={idx} className={styles.cellWrap}>
              <div className={styles.cell} data-state={state}>
                {ch}
              </div>
              <div className={styles.tags}>
                {isL && <span className={styles.tagL}>L</span>}
                {isR && <span className={styles.tagR}>R</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.stats}>
        <div className={styles.statWindow}>
          <span className={styles.statLabel}>window</span>
          <span className={styles.statValue}>&quot;{windowText}&quot;</span>
        </div>
        <div className={styles.statSeen}>
          <span className={styles.statLabel}>seen</span>
          <span className={styles.statValue}>{`{${seen.join(",")}}`}</span>
        </div>
        <div className={styles.statBest}>
          <span className={styles.statLabel}>best so far</span>
          <span className={styles.statBestValue}>{best}</span>
        </div>
      </div>
    </div>
  );
}
