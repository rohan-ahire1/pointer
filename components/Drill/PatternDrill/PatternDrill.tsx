"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { getPattern, getPatterns, getProblems, PATTERN_GROUPS, type PatternGroup } from "@/content";
import { buildRound, DRILL_ROUND_SIZE, type DrillQuestion } from "@/lib/drill";
import { useProgress } from "@/lib/progress";
import styles from "./PatternDrill.module.css";

type GroupChoice = PatternGroup | "all";

const GROUP_CHOICES: { value: GroupChoice; label: string }[] = [
  { value: "all", label: "All patterns" },
  ...(Object.keys(PATTERN_GROUPS) as PatternGroup[]).map((value) => ({
    value,
    label: PATTERN_GROUPS[value].label,
  })),
];

function patternName(slug: string): string {
  return getPattern(slug)?.name ?? slug;
}

function scoreMessage(score: number, total: number): string {
  if (score === total) return "Every one right.";
  if (score / total >= 0.8) return "Strong round. Check the ones you missed.";
  if (score / total >= 0.5) return "Getting there. The misses below show what to look for.";
  return "Keep going. This gets faster with practice, and each miss links to its lesson.";
}

/**
 * /drill: read a problem in plain words, name the pattern. The round is built
 * on click, never during render, so the server and first client render match.
 * Number keys pick an answer and → moves on; both work while focus is anywhere
 * in the drill, which it always is because each step moves focus here.
 */
export function PatternDrill() {
  const { progress, recordDrillRound } = useProgress();
  const [group, setGroup] = useState<GroupChoice>("all");
  const [round, setRound] = useState<DrillQuestion[] | null>(null);
  const [picks, setPicks] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);

  const question = round?.[index];
  const pick = picks[index];
  const answered = pick !== undefined;
  const isLast = round !== null && index === round.length - 1;
  const score = round?.filter((item, i) => picks[i] === item.problem.pattern).length ?? 0;

  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [round, index, finished]);

  useEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);

  function start(only?: string[]) {
    moved.current = true;
    setRound(buildRound(getProblems(), getPatterns(), { random: Math.random, group: only ? "all" : group, only }));
    setPicks([]);
    setIndex(0);
    setFinished(false);
    setIsRetry(only !== undefined);
  }

  function changePatterns() {
    moved.current = true;
    setRound(null);
    setFinished(false);
  }

  function choose(slug: string) {
    if (!answered) setPicks([...picks, slug]);
  }

  function next() {
    if (!isLast) {
      setIndex(index + 1);
      return;
    }
    setFinished(true);
    if (!isRetry && round?.length === DRILL_ROUND_SIZE) recordDrillRound(score);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!question || finished || event.metaKey || event.ctrlKey || event.altKey) return;
    if (answered) {
      if (event.key === "ArrowRight") next();
      return;
    }
    const option = question.options[Number(event.key) - 1];
    if (option) choose(option);
  }

  if (!round) {
    return (
      <div className={styles.card}>
        <h2 ref={headingRef} tabIndex={-1} className={`soft ${styles.setupHeading}`}>
          Which patterns?
        </h2>
        <div role="group" aria-label="Patterns to drill" className={styles.groups}>
          {GROUP_CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              aria-pressed={group === choice.value}
              onClick={() => setGroup(choice.value)}
              className={group === choice.value ? styles.groupActive : styles.group}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => start()} className={styles.primary}>
          Start {DRILL_ROUND_SIZE} questions →
        </button>
        {progress.drillBest !== undefined && (
          <p className={styles.best}>
            Your best: {progress.drillBest} of {DRILL_ROUND_SIZE}
          </p>
        )}
      </div>
    );
  }

  if (finished) {
    const missed = round.filter((item, i) => picks[i] !== item.problem.pattern);
    return (
      <div className={styles.card}>
        <h2 ref={headingRef} tabIndex={-1} className={`soft ${styles.score}`}>
          {score} of {round.length}
        </h2>
        <p className={styles.message}>{scoreMessage(score, round.length)}</p>
        {!isRetry && progress.drillBest !== undefined && (
          <p className={styles.best}>
            Your best: {progress.drillBest} of {DRILL_ROUND_SIZE}
          </p>
        )}
        {missed.length > 0 && (
          <>
            <h3 className={styles.missedHeading}>Worth another look</h3>
            <ul className={styles.missed}>
              {missed.map(({ problem }) => (
                <li key={problem.slug} className={styles.missedItem}>
                  <b>{problem.title}</b>
                  <span>{problem.signal}</span>
                  <Link href={`/patterns/${problem.pattern}`} className={styles.lessonLink}>
                    {patternName(problem.pattern)} lesson →
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className={styles.actions}>
          <button type="button" onClick={() => start()} className={styles.primary}>
            Go again →
          </button>
          {missed.length > 0 && (
            <button
              type="button"
              onClick={() => start(missed.map((item) => item.problem.slug))}
              className={styles.secondary}
            >
              Retry the {missed.length} you missed
            </button>
          )}
          <button type="button" onClick={changePatterns} className={styles.textButton}>
            Change patterns
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;
  const { problem, options } = question;
  const right = pick === problem.pattern;

  return (
    <div role="group" aria-label="Pattern drill" onKeyDown={handleKeyDown} className={styles.card}>
      <div className={styles.progress}>
        <span>
          Question {index + 1} of {round.length}
        </span>
        <span>{score} right</span>
      </div>
      <div aria-hidden="true" className={styles.track}>
        <span className={styles.fill} style={{ width: `${(picks.length / round.length) * 100}%` }} />
      </div>

      <div key={index} className={styles.question}>
        <h2 ref={headingRef} tabIndex={-1} className={styles.prompt}>
          {problem.prompt}
        </h2>
      </div>

      <ol className={styles.options}>
        {options.map((slug, optionIndex) => {
          const isAnswer = slug === problem.pattern;
          const state = !answered ? "open" : isAnswer ? "right" : slug === pick ? "wrong" : "out";
          return (
            <li key={slug}>
              <button
                type="button"
                disabled={answered}
                onClick={() => choose(slug)}
                data-state={state}
                className={styles.option}
              >
                <kbd aria-hidden="true" className={styles.key}>
                  {optionIndex + 1}
                </kbd>
                <span className={styles.optionName}>{patternName(slug)}</span>
                {state === "right" && <span className={styles.verdict}>✓ Right answer</span>}
                {state === "wrong" && <span className={styles.verdict}>✕ Your pick</span>}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Always mounted, so screen readers announce the result when it fills in. */}
      <div role="status">
        {answered && (
          <p className={styles.feedback}>
            <b>{right ? "Right." : `It's ${patternName(problem.pattern)}.`}</b> {problem.signal}
          </p>
        )}
      </div>

      {answered && (
        <div className={styles.actions}>
          <button ref={nextRef} type="button" onClick={next} className={styles.primary}>
            {isLast ? "See your score" : "Next question"} →
          </button>
          <Link href={`/patterns/${problem.pattern}`} className={styles.lessonLink}>
            {patternName(problem.pattern)} lesson
          </Link>
        </div>
      )}
    </div>
  );
}
