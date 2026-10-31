"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PatternGroupSummary } from "@/content";
import { problemsForPattern } from "@/content";
import { useProgress, type LessonSection } from "@/lib/progress";
import { padPatternNumber, type AdjacentPattern } from "@/lib/pattern-nav";
import styles from "./LessonNav.module.css";

const SECTIONS: readonly { id: LessonSection; label: string; index: number }[] = [
  { id: "idea", label: "The idea", index: 1 },
  { id: "watch", label: "Watch", index: 2 },
  { id: "try", label: "Try it", index: 3 },
  { id: "solve", label: "Solve", index: 4 },
];

type LessonNavProps = {
  patternSlug: string;
  patternName: string;
  patternNumber: number;
  totalPatterns: number;
  groups: PatternGroupSummary[];
  prev?: AdjacentPattern;
  next?: AdjacentPattern;
};

/**
 * The lesson bar on a live pattern page (design/mocks/C2-Pattern.dc.html):
 * a pattern switcher listing all 18 patterns, the 4 numbered section tabs
 * (highlighted via IntersectionObserver as the reader scrolls), the
 * solved-count label and prev/next. Also the one place that records lesson
 * scroll progress (setLessonSection) — see the effect below.
 */
export function LessonNav({
  patternSlug,
  patternName,
  patternNumber,
  totalPatterns,
  groups,
  prev,
  next,
}: LessonNavProps) {
  const { progress, setLessonSection } = useProgress();
  const [current, setCurrent] = useState<LessonSection>("idea");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherButtonRef = useRef<HTMLButtonElement>(null);
  const tabsRef = useRef<HTMLOListElement>(null);
  const pillRef = useRef<HTMLLIElement>(null);

  const patternProblems = problemsForPattern(patternSlug);
  const total = patternProblems.length;
  const done = patternProblems.filter((p) => progress.solved[p.slug]).length;

  useEffect(() => {
    const elements = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id as LessonSection;
          setCurrent(id);
          setLessonSection(patternSlug, id);
        }
      },
      // A thin band near the top of the viewport: a section becomes
      // "current" once it crosses into it, which reads better than
      // triggering the instant any part of a (tall) section is visible.
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [patternSlug, setLessonSection]);

  // Slides one pill between the section tabs so the active marker travels
  // with the reader instead of jumping. Until it has measured, the active
  // tab keeps its own background, so nothing depends on this running.
  useEffect(() => {
    const list = tabsRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;

    function place() {
      const active = list?.querySelector<HTMLElement>('[aria-current="true"]');
      if (!list || !pill || !active) return;
      pill.style.width = `${active.offsetWidth}px`;
      pill.style.height = `${active.offsetHeight}px`;
      pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
      if (!list.dataset.pill) {
        list.dataset.pill = "placed";
        // Turn transitions on only after the first placement, so the pill
        // doesn't slide in from the corner on load.
        requestAnimationFrame(() => {
          if (list.dataset.pill) list.dataset.pill = "moving";
        });
      }
    }

    place();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    observer.observe(list);
    return () => observer.disconnect();
  }, [current]);

  useEffect(() => {
    if (!switcherOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSwitcherOpen(false);
        switcherButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [switcherOpen]);

  return (
    <div className={styles.wrap} data-lesson-nav>
      <nav aria-label="Lesson" className={styles.bar}>
        <div className={styles.topRow}>
          <Link href="/patterns" aria-label="Back to all patterns" className={styles.backButton}>
            <span aria-hidden="true">←</span>
          </Link>
          <button
            type="button"
            ref={switcherButtonRef}
            onClick={() => setSwitcherOpen((open) => !open)}
            aria-expanded={switcherOpen}
            aria-controls="pattern-switcher"
            className={styles.switcherButton}
          >
            <span className={styles.switcherNumber}>{padPatternNumber(patternNumber)}</span> {patternName}
            <ChevronIcon />
            <span className="sr-only">— switch pattern</span>
          </button>
        </div>

        <ol ref={tabsRef} className={styles.tabs}>
          <li ref={pillRef} aria-hidden="true" className={styles.pill} />
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={current === section.id ? "true" : undefined}
                className={current === section.id ? styles.tabActive : styles.tab}
              >
                <span className={styles.tabIndex}>{section.index}</span>
                {section.label}
              </a>
            </li>
          ))}
        </ol>

        <span className={styles.progressLabel}>
          Lesson {patternNumber} of {totalPatterns} · {done} of {total} solved
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
              className={styles.adjacentButtonAccent}
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

      {switcherOpen && (
        <div id="pattern-switcher" className={styles.switcherPanel}>
          {groups.map((group) => (
            <div key={group.key} className={styles.switcherGroup}>
              <h3 className={styles.switcherGroupTitle}>{group.label.toUpperCase()}</h3>
              {group.patterns.map((p) => {
                const isCurrent = p.slug === patternSlug;
                const statusLabel = isCurrent ? "you are here" : p.status === "live" ? "live now" : "coming soon";
                return (
                  <Link
                    key={p.slug}
                    href={`/patterns/${p.slug}`}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => setSwitcherOpen(false)}
                    className={isCurrent ? styles.switcherItemCurrent : styles.switcherItem}
                  >
                    <span className={styles.switcherItemNumber}>{padPatternNumber(p.number)}</span>
                    <span className={styles.switcherItemName}>{p.name}</span>
                    <span className={styles.switcherItemStatus}>{statusLabel}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
