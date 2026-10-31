import type { Metadata } from "next";
import Link from "next/link";
import { getPatternGroups } from "@/content";
import { PATTERN_GUIDES } from "@/content/guides";
import { padPatternNumber } from "@/lib/pattern-nav";
import { chipColorForNumber, groupNumberRange } from "@/lib/pattern-style";
import { CodeLangToggle } from "@/components/CodeLangToggle/CodeLangToggle";
import { CheckIcon, CrossIcon } from "@/components/icons/Icons";
import { PatternCode } from "@/components/PatternCode/PatternCode";
import { PrintButton } from "@/components/Cheatsheet/PrintButton/PrintButton";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cheat sheet",
  description: "All 18 coding interview patterns on one page: when to use each, the code skeleton, the Big-O and the usual mistakes.",
  alternates: { canonical: "/cheatsheet" },
};

/** One band colour per group, in the order the groups are listed. */
const BAND_COLORS = ["var(--yellow)", "var(--lilac)", "var(--mint)"];

/** Every pattern on one printable page, for the night before an interview. */
export default function CheatsheetPage() {
  const groups = getPatternGroups().map((group) => ({
    ...group,
    entries: group.patterns.flatMap((pattern) => {
      const guide = PATTERN_GUIDES[pattern.slug];
      return pattern.status === "live" && guide ? [{ pattern, guide }] : [];
    }),
  }));

  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/">Home</Link> <span aria-hidden="true">›</span> <span aria-current="page">Cheat sheet</span>
      </nav>
      <div className={styles.head}>
        <div className={styles.headCopy}>
          <h1 className={`soft ${styles.title}`}>Cheat sheet</h1>
          <p className={styles.lead}>All 18 patterns on one page. Good for the night before an interview.</p>
        </div>
        <div className={styles.tools} data-no-print>
          <CodeLangToggle />
          <PrintButton />
        </div>
      </div>

      <div className={styles.sheet}>
        <nav id="spot" aria-labelledby="spot-heading" className={styles.index}>
          <div className={styles.indexBand}>
            <h2 id="spot-heading" className={`soft ${styles.indexHeading}`}>
              Spot the pattern
            </h2>
            <p className={styles.indexHint}>Read the clue, jump to the pattern.</p>
          </div>
          <div className={styles.indexGroups}>
            {groups.map((group) => (
              <div key={group.key} className={styles.indexGroup}>
                <h3 className={styles.indexLabel}>{group.label}</h3>
                <ol className={styles.indexList}>
                  {group.entries.map(({ pattern }) => (
                    <li key={pattern.slug}>
                      <a href={`#${pattern.slug}`} className={styles.indexLink}>
                        <span className={styles.number} style={{ background: chipColorForNumber(pattern.number) }}>
                          {padPatternNumber(pattern.number)}
                        </span>
                        <span className={styles.indexText}>
                          <span className={styles.indexName}>{pattern.name}</span>
                          <span className={styles.indexClue}>{pattern.whenToUse[0]}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </nav>

        {groups.map((group, index) => (
          <section key={group.key} aria-labelledby={`group-${group.key}`}>
            <div className={styles.band} style={{ background: BAND_COLORS[index % BAND_COLORS.length] }}>
              <h2 id={`group-${group.key}`} className={`soft ${styles.bandHeading}`}>
                {group.label}
              </h2>
              <span className={styles.bandRange}>{groupNumberRange(group.patterns)}</span>
              <a href="#spot" className={styles.bandLink} data-no-print>
                All patterns
              </a>
            </div>
            {group.entries.map(({ pattern, guide }) => (
              <article key={pattern.slug} id={pattern.slug} className={styles.row}>
                <div className={styles.identity}>
                  <div className={styles.nameLine}>
                    <span className={styles.number} style={{ background: chipColorForNumber(pattern.number) }}>
                      {padPatternNumber(pattern.number)}
                    </span>
                    <h3 className={`soft ${styles.name}`}>
                      <Link href={`/patterns/${pattern.slug}`}>{pattern.name}</Link>
                    </h3>
                  </div>
                  <p className={styles.idea}>{pattern.idea}</p>
                  <dl className={styles.big}>
                    <div className={styles.fact}>
                      <dt>Time</dt>
                      <dd>{pattern.complexity}</dd>
                    </div>
                    <div className={styles.fact}>
                      <dt>Space</dt>
                      <dd>{pattern.space}</dd>
                    </div>
                  </dl>
                </div>
                <div className={styles.notes}>
                  <div>
                    <h4 className={styles.label}>Reach for it when</h4>
                    <ul className={styles.list}>
                      {pattern.whenToUse.map((item) => (
                        <li key={item} className={styles.item}>
                          <CheckIcon />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className={styles.label}>Easy ways to go wrong</h4>
                    <ul className={styles.list}>
                      {guide.pitfalls.map((item) => (
                        <li key={item} className={`${styles.item} ${styles.pitfall}`}>
                          <CrossIcon />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={styles.codeCell}>
                  <PatternCode template={guide.template} patternName={pattern.name} heading="Start from this" />
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
