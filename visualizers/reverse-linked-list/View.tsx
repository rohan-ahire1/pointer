import { Fragment, type CSSProperties } from "react";
import type { Step } from "../types";
import { Cell, Fit, Stats, ViewRoot } from "../kit";
import type { ReverseInput, ReverseState } from "./types";
import styles from "./View.module.css";

type ReverseViewProps = { step: Step<ReverseState>; input: ReverseInput };

/** Widths relative to a cell (match .gap and .null in the stylesheet): tight enough that 7 nodes fit at 320px. */
const GAP_RATIO = 0.4;
const NULL_RATIO = 0.7;

type Pointer = "prev" | "curr" | "next";
const TONE: Record<Pointer, string> = { prev: "inverse", curr: "orange", next: "lilac" };

type Arrow = "right" | "left" | null;

/** Follows `next` pointers from a start node and reads the chain: "2 → 1 → ∅". */
function chain(values: number[], next: (number | null)[], start: number | null): string {
  const parts: string[] = [];
  const seen = new Set<number>();
  let at = start;
  while (at !== null && !seen.has(at)) {
    seen.add(at);
    parts.push(String(values[at]));
    at = next[at];
  }
  return [...parts, "∅"].join(" → ");
}

/**
 * docs/patterns/06-linked-list.md: the nodes never move; only the arrows in
 * the gaps between them change. A gap shows → when the left node points
 * right, ← when the right node points back, and nothing while the list is
 * cut between saving `next` and flipping the arrow.
 */
export function ReverseLinkedListView({ step }: ReverseViewProps) {
  const { values, next, prev, curr, nxt, phase, flipping, reversed } = step.state;
  const n = values.length;
  const flipped = new Set(reversed);

  // A null prev points at the left ∅; a null curr or next points at the right ∅.
  const nextShown = phase === "save" || phase === "flip" || phase === "advance";
  const pointsAt = (pointer: Pointer, id: number | "left-null" | "right-null"): boolean => {
    if (pointer === "prev") return prev === null ? id === "left-null" : prev === id;
    if (pointer === "curr") return curr === null ? id === "right-null" : curr === id;
    return nextShown && (nxt === null ? id === "right-null" : nxt === id);
  };
  // One fixed row per pointer, so tags on neighbouring nodes never collide
  // even when cells are narrower than the tag text.
  const tags = (id: number | "left-null" | "right-null") => (
    <div className={styles.tags}>
      {(["prev", "curr", "next"] as const).map((pointer) => (
        <span key={pointer} className={styles.tagRow}>
          {pointsAt(pointer, id) && (
            <span className={styles.tag} data-tone={TONE[pointer]}>
              {pointer}
            </span>
          )}
        </span>
      ))}
    </div>
  );

  // Gap k sits between slot k-1 and slot k, where slot -1 is the left ∅ and slot n is the right ∅.
  const arrowIn = (k: number): Arrow => {
    if (k === 0) return next[0] === null && flipped.has(0) ? "left" : null;
    if (k === n) return next[n - 1] === null && !flipped.has(n - 1) ? "right" : null;
    if (next[k - 1] === k) return "right";
    if (next[k] === k - 1) return "left";
    return null;
  };

  const gap = (k: number) => {
    const arrow = arrowIn(k);
    return (
      <div className={styles.gap} data-cut={arrow === null}>
        {arrow && (
          <svg key={arrow} className={styles.arrow} data-dir={arrow} viewBox="0 0 24 12" preserveAspectRatio="none">
            <line x1="1" y1="6" x2="21" y2="6" />
            <polyline points="16,1 22,6 16,11" />
          </svg>
        )}
      </div>
    );
  };

  return (
    <ViewRoot>
      <Fit n={n + 2 * NULL_RATIO + (n + 1) * GAP_RATIO}>
        <div className={styles.row} style={{ "--units": n + 2 * NULL_RATIO + (n + 1) * GAP_RATIO } as CSSProperties}>
          <div className={`${styles.slot} ${styles.null}`}>
            <Cell value="∅" state="past" size="sm" />
            {tags("left-null")}
          </div>
          {values.map((value, idx) => (
            <Fragment key={idx}>
              {gap(idx)}
              <div className={styles.slot}>
                <Cell
                  value={value}
                  state={idx === flipping && phase === "flip" ? "current" : flipped.has(idx) ? "found" : "waiting"}
                />
                {tags(idx)}
              </div>
            </Fragment>
          ))}
          {gap(n)}
          <div className={`${styles.slot} ${styles.null}`}>
            <Cell value="∅" state="past" size="sm" />
            {tags("right-null")}
          </div>
        </div>
      </Fit>
      <div className={styles.reads}>
        <div className={styles.readLine}>
          <span className={styles.readLabel}>prev</span>
          <span>{prev === null ? "∅" : chain(values, next, prev)}</span>
        </div>
        <div className={styles.readLine}>
          <span className={styles.readLabel}>curr</span>
          <span>{curr === null ? "∅" : chain(values, next, curr)}</span>
        </div>
      </div>
      <Stats
        items={[
          { label: "prev", value: prev === null ? "∅" : values[prev] },
          { label: "curr", value: curr === null ? "∅" : values[curr] },
          { label: "next", value: nxt === null ? "∅" : values[nxt] },
          { label: "new head", value: phase === "done" && prev !== null ? values[prev] : "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
