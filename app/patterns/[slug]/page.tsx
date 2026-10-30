import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPattern, getPatterns, getPatternGroups, problemsForPattern, PATTERN_GROUPS } from "@/content";
import { getAdjacentPatterns } from "@/lib/pattern-nav";
import { LessonVisualizers } from "@/visualizers/player/LessonVisualizers";
import { LessonNav } from "@/components/Lesson/LessonNav/LessonNav";
import { LessonHero } from "@/components/Lesson/LessonHero/LessonHero";
import { LessonWatch } from "@/components/Lesson/LessonWatch/LessonWatch";
import { SolveSection } from "@/components/Lesson/SolveSection/SolveSection";
import { PATTERN_GUIDES } from "@/content/guides";
import { UpNextCard } from "@/components/Lesson/UpNextCard/UpNextCard";
import { SoonLesson } from "@/components/Lesson/SoonLesson/SoonLesson";
import { JsonLd } from "@/components/JsonLd/JsonLd";
import { SITE_URL } from "@/lib/site";
import styles from "./page.module.css";

type PatternPageProps = {
  params: Promise<{ slug: string }>;
};

/** All 15 patterns get a static route, whether they're live or "coming soon" (CLAUDE.md). */
export function generateStaticParams() {
  return getPatterns().map((pattern) => ({ slug: pattern.slug }));
}

export async function generateMetadata({ params }: PatternPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) {
    return { title: "Pattern not found" };
  }
  const description = pattern.status === "live" ? pattern.analogy : pattern.idea;
  return {
    title: pattern.name,
    description,
    alternates: { canonical: `/patterns/${pattern.slug}` },
  };
}

export default async function PatternPage({ params }: PatternPageProps) {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) {
    notFound();
  }

  const totalPatterns = getPatterns().length;
  const { prev, next } = getAdjacentPatterns(pattern.slug);
  const groupLabel = PATTERN_GROUPS[pattern.group].label;

  if (pattern.status === "soon") {
    return (
      <SoonLesson pattern={pattern} groupLabel={groupLabel} totalPatterns={totalPatterns} prev={prev} next={next} />
    );
  }

  const problems = problemsForPattern(pattern.slug);
  const groups = getPatternGroups();

  const url = `${SITE_URL}/patterns/${pattern.slug}`;

  return (
    <div className={styles.page}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "LearningResource",
              name: `${pattern.name} coding interview pattern`,
              description: pattern.analogy,
              url,
              learningResourceType: "Lesson",
              teaches: pattern.name,
              timeRequired: `PT${pattern.minutes}M`,
              isAccessibleForFree: true,
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Patterns", item: `${SITE_URL}/patterns` },
                { "@type": "ListItem", position: 3, name: pattern.name, item: url },
              ],
            },
          ],
        }}
      />
      <LessonNav
        patternSlug={pattern.slug}
        patternName={pattern.name}
        patternNumber={pattern.number}
        totalPatterns={totalPatterns}
        groups={groups}
        prev={prev}
        next={next}
      />

      <div className={styles.main}>
        <LessonHero pattern={pattern} groupLabel={groupLabel} />
        <LessonWatch video={pattern.video} slug={pattern.slug} title={`${pattern.name} in 60 seconds`} />

        <section id="try" aria-labelledby="try-h" className={styles.trySection}>
          <div className={styles.tryHead}>
            <h2 id="try-h" className={`soft ${styles.tryHeading}`}>
              <span className={styles.tryHeadingIndex}>3 · </span>Now you drive
            </h2>
            <div className={styles.keys}>
              Keys:
              <kbd className={styles.key}>←</kbd>
              <kbd className={styles.key}>→</kbd> step
              <kbd className={styles.key}>Space</kbd> play
              <kbd className={styles.key}>R</kbd> reset
              <kbd className={styles.key}>Home</kbd>
              <kbd className={styles.key}>End</kbd> jump
            </div>
          </div>
          <LessonVisualizers ids={[pattern.visualizer, ...(pattern.moreVisualizers ?? [])]} />
        </section>

        <SolveSection problems={problems} patternName={pattern.name} guide={PATTERN_GUIDES[pattern.slug]} />

        <UpNextCard totalPatterns={totalPatterns} prev={prev} next={next} />
      </div>
    </div>
  );
}
