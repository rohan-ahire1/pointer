"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import type { Step, Visualizer } from "../types";
import styles from "./VisualizerPlayer.module.css";

type Speed = 0.5 | 1 | 2;

/** Playback speed -> ms per step (design/visualizer-spec.md: 0.5x/1x/2x -> 1800/900/450). */
const SPEED_MS: Record<Speed, number> = { 0.5: 1800, 1: 900, 2: 450 };
const SPEEDS: readonly Speed[] = [0.5, 1, 2];

type VisualizerPlayerProps<I, S> = {
  visualizer: Visualizer<I, S>;
};

function isParseError<I>(parsed: I | { error: string }): parsed is { error: string } {
  return typeof parsed === "object" && parsed !== null && "error" in parsed;
}

/**
 * Shared player UI for every pattern visualizer (design/visualizer-spec.md):
 * input field, presets, Back / Step / Play-Pause / Reset, speed, keyboard
 * shortcuts, step counter, narration bubble and code panel. Each
 * visualizer only supplies `trace` + a small `View` — everything else
 * (including this component) is generic over `<I, S>`.
 */
export function VisualizerPlayer<I, S>({ visualizer }: VisualizerPlayerProps<I, S>) {
  const { title, code, parseInput, presets, trace, View, inputLabel, inputHint, inputMaxLength = 10 } = visualizer;

  const [raw, setRaw] = useState<string>(presets[0] ?? "");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Whether any part of the player is on screen. The phone transport bar
  // (fixed to the viewport bottom) only shows while it is, so it never
  // covers the rest of the lesson or the footer.
  const [inView, setInView] = useState(false);

  const parsed = useMemo(() => parseInput(raw), [parseInput, raw]);
  const error = isParseError(parsed) ? parsed.error : null;

  const steps = useMemo<Step<S>[]>(() => {
    if (isParseError(parsed)) return [];
    return trace(parsed);
  }, [parsed, trace]);

  const hasSteps = steps.length > 0;
  const clampedIndex = hasSteps ? Math.min(stepIndex, steps.length - 1) : 0;
  const currentStep = hasSteps ? steps[clampedIndex] : undefined;

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // New input (typed or preset) always restarts at the first step, paused.
  // Adjusted during render rather than in an effect — React's documented
  // "adjusting state when a prop changes" pattern (a state value tracking
  // the previous input, compared during render — not a ref, which must not
  // be read or written during render) — so it takes effect before the
  // first paint of the new input, with no extra render pass.
  const [prevRaw, setPrevRaw] = useState(raw);
  if (prevRaw !== raw) {
    setPrevRaw(raw);
    if (stepIndex !== 0) setStepIndex(0);
    if (playing) setPlaying(false);
  }

  // Unmount cleanup.
  useEffect(() => stopTimer, [stopTimer]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const step = useCallback(
    (delta: number) => {
      setStepIndex((prev) => {
        const max = steps.length - 1;
        if (max < 0) return 0;
        return Math.max(0, Math.min(max, prev + delta));
      });
    },
    [steps.length],
  );

  const reset = useCallback(() => {
    stopTimer();
    setPlaying(false);
    setStepIndex(0);
  }, [stopTimer]);

  const togglePlay = useCallback(() => {
    if (!hasSteps) return;
    setPlaying((prev) => {
      if (prev) return false;
      if (clampedIndex >= steps.length - 1) setStepIndex(0);
      return true;
    });
  }, [hasSteps, clampedIndex, steps.length]);

  // Drives autoplay; restarts whenever speed changes while playing, and
  // stops itself (and flips `playing` off) once it reaches the last step.
  useEffect(() => {
    if (!playing || !hasSteps) {
      stopTimer();
      return;
    }
    stopTimer();
    timerRef.current = setInterval(() => {
      setStepIndex((prev) => {
        const max = steps.length - 1;
        if (prev >= max) {
          stopTimer();
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, SPEED_MS[speed]);
    return stopTimer;
  }, [playing, speed, steps.length, hasSteps, stopTimer]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setRaw(event.target.value);
  }

  function loadPreset(value: string) {
    setRaw(value);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName;
    // Ignore shortcuts while typing in the input field...
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    // ...or when Space/Enter is what activates a focused button.
    if (tag === "BUTTON" && (event.key === " " || event.key === "Enter")) return;
    // ...or when ← → should scroll a focused scrollable area (the code panel).
    if (target?.dataset.scrollArrows !== undefined && (event.key === "ArrowLeft" || event.key === "ArrowRight")) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === " ") {
      event.preventDefault();
      togglePlay();
    } else if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      reset();
    }
  }

  const stepLabel = hasSteps ? `Step ${clampedIndex + 1} of ${steps.length}` : "Fix the input to see the trace";
  const srSummary =
    currentStep && hasSteps
      ? `Step ${clampedIndex + 1} of ${steps.length}. ${currentStep.sr}`.trim()
      : "No trace yet — fix the input above.";
  const activeLines = currentStep?.lines ?? [];

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      data-in-view={inView}
      role="group"
      aria-label={`${title} visualizer. Use left and right arrow keys to step, Space to play, R to reset.`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.left}>
        <h3 className={`soft ${styles.title}`}>{title}</h3>

        <div className={styles.inputRow}>
          <label htmlFor={inputId} className={styles.inputLabel}>
            {inputLabel ?? "Input"}
          </label>
          <input
            id={inputId}
            value={raw}
            onChange={handleInputChange}
            maxLength={inputMaxLength}
            autoComplete="off"
            spellCheck={false}
            aria-describedby={error ? `${hintId} ${errorId}` : hintId}
            aria-invalid={error ? true : undefined}
            className={styles.input}
          />
          {presets.length > 0 && (
            <>
              <span className={styles.orTry}>or try</span>
              <div className={styles.presets}>
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => loadPreset(preset)}
                    aria-label={`Load example ${preset}`}
                    className={styles.presetChip}
                  >
                    &quot;{preset}&quot;
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {inputHint && (
          <span id={hintId} className={styles.hint}>
            {inputHint}
          </span>
        )}
        {error && (
          <span id={errorId} role="alert" className={styles.error}>
            {error}
          </span>
        )}

        {currentStep ? (
          <View step={currentStep} input={parsed as I} />
        ) : (
          <p className={styles.emptyState}>Fix the input above to see the trace.</p>
        )}

        <div
          className={styles.narration}
          aria-live={playing ? "off" : "polite"}
          aria-atomic="true"
        >
          <span aria-hidden="true" className={styles.narrationEyebrow}>
            what&rsquo;s happening
          </span>
          <span key={hasSteps ? clampedIndex : "empty"} className={styles.narrationNote}>
            {currentStep?.note ?? "Nothing to trace yet."}
          </span>
          <span className="sr-only">{srSummary}</span>
        </div>

        {/* Below ~768px this row and the step label below it become a
            sticky bar pinned to the bottom of the viewport (design/mocks/
            C2-PhoneLesson.dc.html) — the same Reset/Back/Play/Step buttons
            and handlers as the desktop layout, just repositioned by CSS
            (see .transport in VisualizerPlayer.module.css), so there is
            only ever one set of controls in the accessibility tree. The
            bar only shows while the player is on screen (data-in-view),
            so it never covers the Solve section or footer. */}
        <div className={styles.transport}>
          <div className={styles.controls}>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset to the first step"
              className={styles.iconButton}
            >
              <ResetIcon />
            </button>
            <button type="button" onClick={() => step(-1)} disabled={!hasSteps} className={styles.button}>
              ← Back
            </button>
            <button type="button" onClick={() => step(1)} disabled={!hasSteps} className={styles.buttonAccent}>
              Step →
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={!hasSteps}
              className={styles.buttonPlay}
            >
              {playing ? "Pause" : "Play ▶"}
            </button>
            <div role="group" aria-label="Playback speed" className={styles.speedGroup}>
              {SPEEDS.map((value) => {
                const on = speed === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSpeed(value)}
                    aria-pressed={on}
                    className={on ? styles.speedButtonActive : styles.speedButton}
                  >
                    {value}×
                  </button>
                );
              })}
            </div>
          </div>
          <span className={styles.stepLabel}>{stepLabel}</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.codeHeader}>
          <span className={styles.codeBadge}>solution.ts</span>
          <span className={styles.codeHint}>▶ marks the line running now</span>
        </div>
        {/* Focusable so keyboard users can scroll it when the code is wider
            than the panel (phone widths); ← → scroll it instead of stepping. */}
        <div
          role="list"
          aria-label="TypeScript solution"
          className={styles.codeList}
          tabIndex={0}
          data-scroll-arrows
        >
          {code.map((line, index) => {
            const active = activeLines.includes(index);
            return (
              <div
                key={index}
                role="listitem"
                className={active ? styles.codeLineActive : styles.codeLine}
              >
                <span aria-hidden="true" className={styles.codeMark}>
                  {active ? "▶" : ""}
                </span>
                <span aria-hidden="true" className={styles.codeLineNumber}>
                  {index + 1}
                </span>
                <span className={styles.codeText}>{line === "" ? " " : line}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ResetIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <polyline points="3 3 3 8 8 8" />
    </svg>
  );
}
