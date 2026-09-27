import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Pointer teaches the 15 patterns behind most coding interviews by showing them move, one step at a time.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    bg: "var(--yellow)",
    title: "Patterns, not answers",
    body: "Memorised solutions fall apart in interviews. Recognising the shape of a problem doesn’t.",
  },
  {
    bg: "var(--mint)",
    title: "Free, no account",
    body: "Everything is open. Your progress stays in your own browser.",
  },
  {
    bg: "var(--lilac)",
    title: "Made in code",
    body: "Explainers are animated with Manim, the open-source library created for 3Blue1Brown. Visualizers run the real algorithm.",
  },
];

const ACCESSIBILITY_ITEMS = [
  { title: "Keyboard first.", body: "Every control works with Tab, arrows, Space and Enter. Press / to search." },
  { title: "Screen readers.", body: "The visualizer announces every step in words." },
  { title: "Captions and transcripts", body: "on every explainer." },
  { title: "Your pace.", body: "Slow the visualizer down, or turn on reduced motion to keep things still." },
  { title: "Light and dark", body: "themes, following your system setting." },
  { title: "Never colour alone.", body: "States are also shown with shapes, labels and borders." },
];

const FAQS = [
  {
    q: "Do I need an account?",
    a: "No. Everything is free and your progress is saved in your browser. You can export it to a file whenever you like.",
  },
  {
    q: "Which language is the code in?",
    a: "TypeScript. The ideas carry over to any language, and each lesson explains the logic in plain English first.",
  },
  {
    q: "How often do new patterns come out?",
    a: "When they’re ready. Each one takes a while to animate properly. Follow on Instagram to hear first.",
  },
  {
    q: "Is this enough to pass interviews?",
    a: "It covers the patterns and the classic problems. Pair it with timed practice and mock interviews.",
  },
];

/** /about (design/mocks/C2-About.dc.html): fully static — no client JS needed, since <details>/<summary> is a native disclosure. */
export default function AboutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1 className={`soft ${styles.title}`}>
            About <span className={styles.titleHighlight}>pointer</span>
          </h1>
          <p className={styles.lead}>
            Pointer teaches the 15 patterns behind most coding interviews by showing them move, one step at
            a time. Watch a one-minute animation, drive the visualizer yourself, then solve the real
            problems.
          </p>
        </div>
        <div className={styles.profileCard}>
          <div role="img" aria-label="Photo of Rohan" className={styles.photo}>
            [PHOTO]
          </div>
          <span className={`soft ${styles.profileName}`}>Made by Rohan</span>
          <p className={styles.profileBody}>
            Software engineer. Builds the animations in code, and learns best by seeing things move.
          </p>
          <div className={styles.profileLinks}>
            <a href="#" target="_blank" rel="noopener noreferrer">
              [GITHUB]
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              [LINKEDIN]
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              [INSTAGRAM]
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </header>

      <section aria-label="Principles" className={styles.principles}>
        {PRINCIPLES.map((principle) => (
          <div key={principle.title} className={styles.principleCard} style={{ background: principle.bg }}>
            <h2 className={`soft ${styles.principleTitle}`}>{principle.title}</h2>
            <p className={styles.principleBody}>{principle.body}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="a11y-h" className={styles.a11ySection}>
        <div className={styles.a11yCopy}>
          <h2 id="a11y-h" className={`soft ${styles.sectionHeading}`}>
            Accessibility
          </h2>
          <p className={styles.sectionLead}>
            Pointer aims to meet WCAG 2.2 AA. Found something that gets in your way? Tell me at{" "}
            <a href="mailto:#">[EMAIL]</a> and I&rsquo;ll fix it.
          </p>
        </div>
        <ul className={styles.a11yList}>
          {ACCESSIBILITY_ITEMS.map((item) => (
            <li key={item.title} className={styles.a11yItem}>
              <b>{item.title}</b> {item.body}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq-h" className={styles.faqSection}>
        <h2 id="faq-h" className={`soft ${styles.sectionHeading}`}>
          Questions
        </h2>
        <div className={styles.faqList}>
          {FAQS.map((faq) => (
            <details key={faq.q} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{faq.q}</summary>
              <p className={styles.faqAnswer}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="credits-h" className={styles.credits}>
        <h2 id="credits-h" className={styles.creditsHeading}>
          CREDITS
        </h2>
        <p className={styles.creditsBody}>
          Problem list: the Blind 75, compiled by Yangshun Tay. Pattern grouping inspired by NeetCode.
          Problems link to LeetCode. Animations made with Manim Community.
        </p>
      </section>
    </div>
  );
}
