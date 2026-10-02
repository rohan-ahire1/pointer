import Link from "next/link";
import type { Pattern } from "@/content";
import { chipColorForNumber } from "@/lib/pattern-style";
import { padPatternNumber } from "@/lib/pattern-nav";
import styles from "./PatternCard.module.css";

type PatternCardProps = {
  pattern: Pattern;
  /** "compact" (Home's "Pick a pattern" grid) omits the solved/total row; "full" (/patterns) shows it. */
  variant: "compact" | "full";
  /** Required when variant is "full". */
  solved?: number;
  total?: number;
};

/**
 * One pattern tile, shared between Home's "Pick a pattern" grid
 * (design/mocks/C2-Home.dc.html) and /patterns (design/mocks/C2-Patterns.dc.html)
 * — the same card, just with an extra progress row on the fuller page.
 * Only coming-soon cards carry a label ("Coming soon") and a dashed border.
 */
export function PatternCard({ pattern, variant, solved, total }: PatternCardProps) {
  const live = pattern.status === "live";
  const showProgress = variant === "full" && typeof total === "number" && total > 0;
  const pct = showProgress && typeof solved === "number" ? Math.round((solved / (total as number)) * 100) : 0;

  return (
    <Link
      href={`/patterns/${pattern.slug}`}
      className={`${styles.card} ${live ? styles.cardLive : styles.cardSoon} ${
        variant === "full" ? styles.cardFull : styles.cardCompact
      }`}
    >
      <span className={styles.head}>
        <span className={styles.number} style={{ background: chipColorForNumber(pattern.number) }}>
          {padPatternNumber(pattern.number)}
        </span>
        {!live && <span className={styles.tagSoon}>Coming soon</span>}
      </span>
      <span className={`soft ${styles.name}`}>{pattern.name}</span>
      <span className={styles.idea}>{pattern.idea}</span>
      {showProgress && (
        <span className={styles.progressRow}>
          <span className={styles.progressLabel}>
            {solved} of {total} problems solved
          </span>
          <span aria-hidden="true" className={styles.progressTrack}>
            <span className={styles.progressFill} style={{ width: `${pct}%` }} />
          </span>
        </span>
      )}
    </Link>
  );
}
