"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { getPatterns, getProblems, problemsForPattern, type Difficulty } from "@/content";
import { useProgress } from "@/lib/progress";
import { getContinueLesson } from "@/lib/continue-lesson";
import { isPatternStarted, solvedCountForPattern } from "@/lib/pattern-progress";
import { chipColorForNumber } from "@/lib/pattern-style";
import { padPatternNumber } from "@/lib/pattern-nav";
import styles from "./ProgressDashboard.module.css";

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];
const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: "var(--mint)",
  medium: "var(--yellow)",
  hard: "var(--orange)",
};

const allPatterns = getPatterns();
const allProblems = getProblems();
const livePatterns = allPatterns.filter((pattern) => pattern.status === "live");

function downloadJson(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * /progress's interactive body (design/mocks/C2-Progress.dc.html): stats,
 * a "pick up where you left off" continue card (or an empty state when
 * there's no progress yet), export / import / reset, and a real <table> of
 * per-pattern progress. Everything here reads from the shared progress
 * store, so it's one client component rather than a server page with
 * scattered client islands.
 */
export function ProgressDashboard() {
  const { progress, exportProgress, importProgress, resetProgress } = useProgress();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [importMessage, setImportMessage] = useState<{ kind: "success" | "error"; text: string } | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const keepButtonRef = useRef<HTMLButtonElement>(null);

  const hasAnyProgress = Object.keys(progress.solved).length > 0 || Object.keys(progress.lessons).length > 0;
  const continueLesson = getContinueLesson(progress);

  const solvedTotal = allProblems.filter((problem) => progress.solved[problem.slug] === true).length;
  const startedTotal = allPatterns.filter((pattern) => isPatternStarted(pattern, progress)).length;
  const lessonsFinished = livePatterns.filter(
    (pattern) => progress.lessons[pattern.slug]?.lastSection === "solve",
  ).length;

  const difficultyStats = DIFFICULTY_ORDER.map((difficulty) => {
    const problems = allProblems.filter((problem) => problem.difficulty === difficulty);
    const done = problems.filter((problem) => progress.solved[problem.slug] === true).length;
    return {
      difficulty,
      label: DIFFICULTY_LABEL[difficulty],
      color: DIFFICULTY_COLOR[difficulty],
      done,
      total: problems.length,
      pct: problems.length > 0 ? Math.round((done / problems.length) * 100) : 0,
    };
  });

  const rows = allPatterns.map((pattern) => {
    const { done, total } = solvedCountForPattern(pattern, progress);
    const nextProblem = problemsForPattern(pattern.slug).find(
      (problem) => progress.solved[problem.slug] !== true,
    );
    const lessonSection = progress.lessons[pattern.slug]?.lastSection;
    const lessonLabel =
      pattern.status !== "live"
        ? "Coming soon"
        : lessonSection === "solve"
          ? "Finished"
          : lessonSection
            ? `In progress · ${lessonSection === "idea" ? "The idea" : lessonSection === "watch" ? "Watch" : "Try it"}`
            : "Not started";
    return {
      pattern,
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      lessonLabel,
      next: nextProblem ? nextProblem.title : total > 0 ? "All done ✓" : "—",
    };
  });

  function handleExport() {
    downloadJson("pointer-progress.json", exportProgress());
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Always clear the input's value, even on success, so selecting the
    // exact same file again still fires a change event next time.
    event.target.value = "";
    if (!file) return;
    const text = await file.text();
    const result = importProgress(text);
    setImportMessage(
      result.ok
        ? { kind: "success", text: "Progress imported." }
        : { kind: "error", text: `Import failed: ${result.error}` },
    );
  }

  function openConfirm() {
    setConfirmingReset(true);
  }
  function cancelReset() {
    setConfirmingReset(false);
    resetButtonRef.current?.focus();
  }
  function confirmReset() {
    resetProgress();
    setConfirmingReset(false);
    setImportMessage(null);
    resetButtonRef.current?.focus();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <button type="button" onClick={handleExport} className={styles.controlButton}>
          Export progress
        </button>
        <button type="button" onClick={handleImportClick} className={styles.controlButton}>
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileSelected}
          className="sr-only"
          aria-label="Choose a progress JSON file to import"
        />
        <button type="button" ref={resetButtonRef} onClick={openConfirm} className={styles.resetButton}>
          Reset…
        </button>
      </div>

      <p aria-live="polite" className={importMessage ? styles.messageVisible : "sr-only"}>
        {importMessage?.text ?? ""}
      </p>

      {confirmingReset && (
        <div role="alertdialog" aria-labelledby="reset-confirm-h" className={styles.confirm}>
          <span id="reset-confirm-h" className={styles.confirmText}>
            <b>Reset everything?</b> Your solved problems and lesson progress will be cleared. This
            can&rsquo;t be undone. Export first if you want a backup.
          </span>
          <button type="button" ref={keepButtonRef} onClick={cancelReset} className={styles.controlButton}>
            Keep my progress
          </button>
          <button type="button" onClick={confirmReset} className={styles.confirmButton}>
            Yes, reset
          </button>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statTile}>
          <span className={styles.statLabel}>Problems solved</span>
          <span className={`soft ${styles.statValue}`}>
            {solvedTotal}
            <span className={styles.statOf}> / {allProblems.length}</span>
          </span>
        </div>
        <div className={styles.statTile}>
          <span className={styles.statLabel}>Patterns started</span>
          <span className={`soft ${styles.statValue}`}>
            {startedTotal}
            <span className={styles.statOf}> / {allPatterns.length}</span>
          </span>
        </div>
        <div className={styles.statTile}>
          <span className={styles.statLabel}>Lessons finished</span>
          <span className={`soft ${styles.statValue}`}>
            {lessonsFinished}
            <span className={styles.statOf}> / {livePatterns.length} live</span>
          </span>
        </div>
        <div className={styles.statTile}>
          <span className={styles.statLabel}>By difficulty</span>
          {difficultyStats.map((stat) => (
            <div key={stat.difficulty} className={styles.diffRow}>
              <span className={styles.diffLabel}>{stat.label}</span>
              <span aria-hidden="true" className={styles.diffTrack}>
                <span className={styles.diffFill} style={{ width: `${stat.pct}%`, background: stat.color }} />
              </span>
              <span className={styles.diffText}>
                {stat.done}/{stat.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      {continueLesson ? (
        <Link
          href={`/patterns/${continueLesson.pattern.slug}#${continueLesson.section}`}
          className={styles.continueCard}
        >
          <span className={styles.continueBody}>
            <span className={styles.continueEyebrow}>PICK UP WHERE YOU LEFT OFF</span>
            <span className={`soft ${styles.continueTitle}`}>
              {padPatternNumber(continueLesson.pattern.number)} {continueLesson.pattern.name} ·{" "}
              {continueLesson.sectionIndex} {continueLesson.sectionLabel}
            </span>
            <span className={styles.continueSub}>
              {continueLesson.nextProblem
                ? `Then solve ${continueLesson.nextProblem.title}.`
                : "All of this pattern's problems are solved."}
            </span>
          </span>
          <span aria-hidden="true" className={styles.continueArrow}>
            →
          </span>
        </Link>
      ) : hasAnyProgress ? (
        <div className={styles.emptyState}>
          <p className={`soft ${styles.emptyTitle}`}>No lesson in progress</p>
          <p className={styles.emptyBody}>
            You&rsquo;ve solved {solvedTotal} {solvedTotal === 1 ? "problem" : "problems"} so far. Open a
            lesson to pick up a pattern.
          </p>
          {livePatterns[0] && (
            <Link href={`/patterns/${livePatterns[0].slug}`} className={styles.emptyLink}>
              Start with {livePatterns[0].name} →
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={`soft ${styles.emptyTitle}`}>No progress yet</p>
          <p className={styles.emptyBody}>Solve a problem or open a lesson and it&rsquo;ll show up here.</p>
          {livePatterns[0] && (
            <Link href={`/patterns/${livePatterns[0].slug}`} className={styles.emptyLink}>
              Start with {livePatterns[0].name} →
            </Link>
          )}
        </div>
      )}

      <section aria-labelledby="by-pattern-h" className={styles.tableSection}>
        <h2 id="by-pattern-h" className={`soft ${styles.tableHeading}`}>
          By pattern
        </h2>
        <div className={styles.tableScroll} role="region" aria-label="Progress by pattern" tabIndex={0}>
          <table className={styles.table}>
            <caption className="sr-only">Progress by pattern: lesson status and problems solved</caption>
            <thead>
              <tr>
                <th scope="col">Pattern</th>
                <th scope="col">Lesson</th>
                <th scope="col">Problems</th>
                <th scope="col">Next up</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.pattern.slug}>
                  <th scope="row" className={styles.rowHead}>
                    <span
                      className={styles.rowNumber}
                      style={{ background: chipColorForNumber(row.pattern.number) }}
                    >
                      {padPatternNumber(row.pattern.number)}
                    </span>
                    {row.pattern.name}
                  </th>
                  <td>{row.lessonLabel}</td>
                  <td>
                    <span className={styles.problemsCell}>
                      <span aria-hidden="true" className={styles.problemsTrack}>
                        <span className={styles.problemsFill} style={{ width: `${row.pct}%` }} />
                      </span>
                      {row.done} / {row.total}
                    </span>
                  </td>
                  <td className={styles.nextCell}>{row.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
