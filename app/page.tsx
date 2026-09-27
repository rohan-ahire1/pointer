import Link from "next/link";
import { getPatternGroups, getPatterns } from "@/content";
import { groupNumberRange } from "@/lib/pattern-style";
import { PatternCard } from "@/components/PatternCard/PatternCard";
import { WelcomeBackBanner } from "@/components/Home/WelcomeBackBanner/WelcomeBackBanner";
import { HomeVisualizerCard } from "@/components/Home/HomeVisualizerCard/HomeVisualizerCard";
import styles from "./page.module.css";

const FEATURE_TILES = [
  {
    tag: "01 WATCH",
    tagBg: "var(--yellow)",
    title: "A 60-second explainer",
    body: "Intuition first. The animation shows why it works before any code appears.",
  },
  {
    tag: "02 PLAY",
    tagBg: "var(--mint)",
    title: "Step through it",
    body: "Your input, your pace. Forward and back, one line at a time.",
  },
  {
    tag: "03 PRACTISE",
    tagBg: "var(--lilac)",
    title: "Solve the classics",
    body: "A short, ordered list of real interview problems, with progress saved.",
  },
];

/** Home (design/mocks/C2-Home.dc.html / C2-Home-Dark.dc.html). */
export default function HomePage() {
  const patterns = getPatterns();
  const firstLive = patterns.find((pattern) => pattern.status === "live");
  const groups = getPatternGroups();
  const liveCount = patterns.filter((pattern) => pattern.status === "live").length;
  // Matches the mock's "03 is live. more on the way →" while one lesson is
  // live (the live pattern's number); counts up as lessons ship, and
  // retires the "more on the way" once everything is live.
  const liveNote =
    liveCount === patterns.length
      ? `All ${patterns.length} lessons live →`
      : liveCount === 1 && firstLive
        ? `${String(firstLive.number).padStart(2, "0")} is live. more on the way →`
        : `${String(liveCount).padStart(2, "0")} are live. more on the way →`;

  return (
    <>
      <WelcomeBackBanner />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>15 patterns. zero memorizing.</p>
          <h1 className={`soft ${styles.title}`}>
            Algorithms you can <span className={styles.highlight}>watch move.</span>
          </h1>
          <p className={styles.lead}>
            Every interview pattern, explained with a one-minute animation and a visualizer you can poke,
            pause and step through.
          </p>
          <div className={styles.heroActions}>
            {firstLive && (
              <Link href={`/patterns/${firstLive.slug}`} className={styles.primaryButton}>
                Start with {firstLive.name} →
              </Link>
            )}
            {firstLive && (
              <Link href={`/patterns/${firstLive.slug}#watch`} className={styles.secondaryButton}>
                ▶ Watch 60s
              </Link>
            )}
          </div>
        </div>
        <div className={styles.heroVisual}>
          <HomeVisualizerCard />
        </div>
      </section>

      <section id="patterns" aria-labelledby="patterns-h" className={styles.patternsSection}>
        <div className={styles.patternsHead}>
          <h2 id="patterns-h" className={`soft ${styles.patternsHeading}`}>
            Pick a pattern
          </h2>
          <span className={styles.patternsNote}>{liveNote}</span>
        </div>
        {groups.map((group) => (
          <div key={group.key} className={styles.group}>
            <div className={styles.groupHead}>
              <h3 className={styles.groupTitle}>{group.label.toUpperCase()}</h3>
              <span className={styles.groupBlurb}>{group.description}</span>
              <span className={styles.groupRange}>{groupNumberRange(group.patterns)}</span>
            </div>
            <ul className={styles.grid}>
              {group.patterns.map((pattern) => (
                <li key={pattern.slug}>
                  <PatternCard pattern={pattern} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={styles.features} aria-label="How Pointer teaches a pattern">
        {FEATURE_TILES.map((tile) => (
          <div key={tile.tag} className={styles.featureTile}>
            <span className={styles.featureTag} style={{ background: tile.tagBg }}>
              {tile.tag}
            </span>
            <h3 className={`soft ${styles.featureTitle}`}>{tile.title}</h3>
            <p className={styles.featureBody}>{tile.body}</p>
          </div>
        ))}
      </section>
    </>
  );
}
