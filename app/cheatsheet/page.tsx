import type { Metadata } from "next";
import Link from "next/link";
import { getPatternGroups } from "@/content";
import { PATTERN_GUIDES } from "@/content/guides";
import { padPatternNumber } from "@/lib/pattern-nav";
import { chipColorForNumber } from "@/lib/pattern-style";
import { CodeLangToggle } from "@/components/CodeLangToggle/CodeLangToggle";
import { PatternCode } from "@/components/PatternCode/PatternCode";
import { PrintButton } from "@/components/Cheatsheet/PrintButton/PrintButton";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cheat sheet",
  description: "All 15 coding interview patterns on one page: when to use each, the code skeleton, the Big-O and the usual mistakes.",
  alternates: { canonical: "/cheatsheet" },
};

/** Every pattern on one printable page, for the night before an interview. */
export default function CheatsheetPage() {
  const groups = getPatternGroups();

  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/">Home</Link> <span aria-hidden="true">›</span> <span aria-current="page">Cheat sheet</span>
      </nav>
      <div className={styles.head}>
        <div className={styles.headCopy}>
          <h1 className={`soft ${styles.title}`}>Cheat sheet</h1>
          <p className={styles.lead}>All 15 patterns on one page. Good for the night before an interview.</p>
        </div>
        <div className={styles.tools} data-no-print>
          <CodeLangToggle />
          <PrintButton />
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`group-${group.key}`} className={styles.group}>
          <h2 id={`group-${group.key}`} className={`soft ${styles.groupHeading}`}>
            {group.label}
          </h2>
          <div className={styles.grid}>
            {group.patterns.map((pattern) => {
              const guide = PATTERN_GUIDES[pattern.slug];
              if (pattern.status !== "live" || !guide) return null;
              return (
                <article key={pattern.slug} id={pattern.slug} className={styles.card}>
                  <div className={styles.cardHead}>
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
                  <h4 className={styles.label}>Reach for it when</h4>
                  <ul className={styles.list}>
                    {pattern.whenToUse.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <h4 className={styles.label}>Start from this</h4>
                  <PatternCode template={guide.template} patternName={pattern.name} />
                  <h4 className={styles.label}>Easy ways to go wrong</h4>
                  <ul className={styles.list}>
                    {guide.pitfalls.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
