"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { SoonPattern } from "@/content";
import { getPatterns, problemsForPattern } from "@/content";
import { padPatternNumber, type AdjacentPattern } from "@/lib/pattern-nav";
import styles from "./SoonLesson.module.css";

type ReadinessItem = {
  label: string;
  status: "ready" | "in-progress" | "not-started";
};

type SoonLessonProps = {
  pattern: SoonPattern;
  groupLabel: string;
  totalPatterns: number;
  prev?: AdjacentPattern;
  next?: AdjacentPattern;
};

const STATUS_LABEL: Record<ReadinessItem["status"], string> = {
  ready: "Ready",
  "in-progress": "Being written",
  "not-started": "Not started",
};

/**
 * The "coming soon" lesson state (design/mocks/C2-Soon.dc.html), shown for
 * every pattern except Sliding Window: what's ready so far, a non-
 * functional notify-me signup (the CLAUDE.md `[EMAIL SIGNUP SERVICE]`
 * placeholder — this form never submits anywhere), and "meanwhile" links
 * to what's already live.
 */
export function SoonLesson({ pattern, groupLabel, totalPatterns, prev, next }: SoonLessonProps) {
  const [notifySent, setNotifySent] = useState(false);
  const problems = problemsForPattern(pattern.slug);
  const firstProblem = problems[0];
  const livePattern = getPatterns().find((p) => p.status === "live");

  const readiness: ReadinessItem[] = [
    { label: "The idea and analogy", status: pattern.analogy ? "ready" : "not-started" },
    { label: "The practice problems", status: problems.length > 0 ? "ready" : "not-started" },
    { label: "60-second explainer", status: "not-started" },
    { label: "Step-through visualizer", status: "not-started" },
  ];

  function handleNotify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotifySent(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.navWrap}>
        <nav aria-label="Lesson" className={styles.bar}>
          <Link href="/patterns" className={styles.switcherLink}>
            <span className={styles.switcherNumber}>{padPatternNumber(pattern.number)}</span> {pattern.name}
            <span aria-hidden="true"> ▾</span>
            <span className="sr-only">, switch pattern</span>
          </Link>
          <span className={styles.message}>This lesson is still being made. Here&rsquo;s what&rsquo;s ready.</span>
          <span className={styles.progressLabel}>
            Lesson {pattern.number} of {totalPatterns}
          </span>
          <div className={styles.adjacent}>
            {prev ? (
              <Link
                href={`/patterns/${prev.slug}`}
                aria-label={`Previous pattern: ${padPatternNumber(prev.number)} ${prev.name}`}
                className={styles.adjacentButton}
              >
                ←
              </Link>
            ) : (
              <span aria-hidden="true" className={styles.adjacentButtonDisabled}>
                ←
              </span>
            )}
            {next ? (
              <Link
                href={`/patterns/${next.slug}`}
                aria-label={`Next pattern: ${padPatternNumber(next.number)} ${next.name}`}
                className={styles.adjacentButton}
              >
                →
              </Link>
            ) : (
              <span aria-hidden="true" className={styles.adjacentButtonDisabled}>
                →
              </span>
            )}
          </div>
        </nav>
      </div>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
              <Link href="/patterns">Patterns</Link> <span aria-hidden="true">›</span> {groupLabel}{" "}
              <span aria-hidden="true">›</span> <span aria-current="page">{pattern.name}</span>
            </nav>
            <div className={styles.titleRow}>
              <h1 className={`soft ${styles.title}`}>{pattern.name}</h1>
              <span className={styles.badge}>Coming soon</span>
            </div>
            <p className={styles.idea}>{pattern.analogy ?? pattern.idea}</p>
          </div>
        </header>

        <section aria-labelledby="ready-h" className={styles.readySection}>
          <div className={styles.readyCard}>
            <h2 id="ready-h" className={`soft ${styles.readyTitle}`}>
              What&rsquo;s ready
            </h2>
            <ul className={styles.readyList}>
              {readiness.map((item) => (
                <li
                  key={item.label}
                  className={item.status === "ready" ? styles.readyItemDone : styles.readyItemPending}
                >
                  <span aria-hidden="true" className={item.status === "ready" ? styles.readyIconDone : styles.readyIconPending}>
                    {item.status === "ready" ? "✓" : "…"}
                  </span>
                  <span className={styles.readyLabel}>{item.label}</span>
                  <span className={styles.readyStatus}>{STATUS_LABEL[item.status]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.notifyCol}>
            <form onSubmit={handleNotify} className={styles.notifyForm}>
              <h2 className={`soft ${styles.notifyTitle}`}>Hear when it&rsquo;s live</h2>
              <p className={styles.notifyCopy}>One email when {pattern.name} goes live. Nothing else.</p>
              {!notifySent ? (
                <div className={styles.notifyRow}>
                  <label htmlFor="notify-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="notify-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={styles.notifyInput}
                  />
                  <button type="submit" className={styles.notifyButton}>
                    Notify me
                  </button>
                </div>
              ) : (
                <p role="status" className={styles.notifySent}>
                  You&rsquo;re on the list. See you when it&rsquo;s live.
                </p>
              )}
              <span className={styles.placeholderNote}>[EMAIL SIGNUP SERVICE] — this form is a placeholder and does not submit anywhere yet.</span>
            </form>
            <span className={styles.instagramPlaceholder}>
              Or follow along on Instagram <span className={styles.placeholderNote}>[INSTAGRAM]</span>
            </span>
          </div>
        </section>

        <section aria-labelledby="meanwhile-h" className={styles.meanwhileSection}>
          <h2 id="meanwhile-h" className={`soft ${styles.meanwhileTitle}`}>
            Meanwhile
          </h2>
          <div className={styles.meanwhileGrid}>
            {firstProblem && (
              <Link href="/problems" className={styles.meanwhileCard}>
                <span className={styles.meanwhileDiff}>{firstProblem.difficulty}</span>
                <span className={`soft ${styles.meanwhileName}`}>{firstProblem.title}</span>
                <span className={styles.meanwhileCopy}>
                  A {pattern.name} problem from the Blind 75. Give it a shot while this lesson comes together.
                </span>
              </Link>
            )}
            {livePattern && (
              <Link href={`/patterns/${livePattern.slug}`} className={styles.meanwhileLiveCard}>
                <span className={styles.meanwhileEyebrow}>
                  LIVE NOW · LESSON {livePattern.number}
                </span>
                <span className={`soft ${styles.meanwhileName}`}>{livePattern.name}</span>
                <span className={styles.meanwhileCopy}>Finish the one that&rsquo;s ready.</span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
