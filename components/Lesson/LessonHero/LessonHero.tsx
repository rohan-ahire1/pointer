import Link from "next/link";
import type { LivePattern } from "@/content";
import styles from "./LessonHero.module.css";

type LessonHeroProps = {
  pattern: LivePattern;
  groupLabel: string;
};

/** Splits "Sliding Window" into ["Sliding ", "Window"] so the last word gets the highlight treatment. */
function splitTitle(name: string): { lead: string; last: string } {
  const words = name.split(" ");
  const last = words.pop() ?? name;
  return { lead: words.length > 0 ? `${words.join(" ")} ` : "", last };
}

/**
 * The hero (design/mocks/C2-Pattern.dc.html #idea): breadcrumb, the page's
 * one <h1>, analogy, meta row and the "Reach for it when…" callout. Pure
 * markup — no client state — since none of it depends on progress.
 */
export function LessonHero({ pattern, groupLabel }: LessonHeroProps) {
  const { lead, last } = splitTitle(pattern.name);
  // A single word this long ("Backtracking") can't wrap, so it gets a smaller
  // phone size; shorter titles keep the design's size.
  const hasLongWord = pattern.name.split(" ").some((word) => word.length >= 11);

  return (
    <header id="idea" className={styles.header}>
      <div className={styles.copy}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/patterns">Patterns</Link> <span aria-hidden="true">›</span> {groupLabel}{" "}
          <span aria-hidden="true">›</span> <span aria-current="page">{pattern.name}</span>
        </nav>
        <h1 className={`soft ${styles.title}`} data-long-word={hasLongWord}>
          {lead}
          <span className={styles.highlight}>{last}</span>
        </h1>
        <p className={styles.analogy}>{pattern.analogy}</p>
        <div className={styles.meta}>
          <span>⏱ about {pattern.minutes} minutes</span>
          <span aria-hidden="true">·</span>
          <span>Needs: {pattern.needs.join(", ")}</span>
          <span aria-hidden="true">·</span>
          <span>Time {pattern.complexity}</span>
          <span aria-hidden="true">·</span>
          <span>Space {pattern.space}</span>
        </div>
      </div>

      <aside aria-label="When to use it" className={styles.calloutWrap}>
        <div className={`tilt ${styles.callout}`}>
          <h2 className={styles.calloutTitle}>Reach for it when…</h2>
          <ul className={styles.calloutList}>
            {pattern.whenToUse.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </header>
  );
}
