import Link from "next/link";
import { padPatternNumber, type AdjacentPattern } from "@/lib/pattern-nav";
import { getPattern } from "@/content";
import styles from "./UpNextCard.module.css";

type UpNextCardProps = {
  totalPatterns: number;
  prev?: AdjacentPattern;
  next?: AdjacentPattern;
};

/** The "Up next" band at the bottom of a lesson (design/mocks/C2-Pattern.dc.html). */
export function UpNextCard({ totalPatterns, prev, next }: UpNextCardProps) {
  const nextIdea = next ? getPattern(next.slug)?.idea : undefined;

  return (
    <section aria-label="Up next" className={styles.section}>
      {next ? (
        <Link href={`/patterns/${next.slug}`} className={styles.nextCard}>
          <span className={styles.nextCopy}>
            <span className={styles.eyebrow}>
              UP NEXT · LESSON {next.number} OF {totalPatterns}
            </span>
            <span className={`soft ${styles.nextName}`}>{next.name}</span>
            {nextIdea && <span className={styles.nextIdea}>{nextIdea}</span>}
          </span>
          <span aria-hidden="true" className={styles.nextArrow}>
            →
          </span>
        </Link>
      ) : (
        <Link href="/patterns" className={styles.nextCard}>
          <span className={styles.nextCopy}>
            <span className={styles.eyebrow}>THAT&rsquo;S ALL 15</span>
            <span className={`soft ${styles.nextName}`}>See every pattern</span>
          </span>
          <span aria-hidden="true" className={styles.nextArrow}>
            →
          </span>
        </Link>
      )}

      <div className={styles.links}>
        {prev && (
          <Link href={`/patterns/${prev.slug}`} className={styles.linkButton}>
            ← Back to {padPatternNumber(prev.number)} {prev.name}
          </Link>
        )}
        <Link href="/patterns" className={styles.linkButton}>
          All {totalPatterns} patterns
        </Link>
      </div>
    </section>
  );
}
