import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Stats, ViewRoot } from "../kit";
import type { MergeInput, MergeState } from "./types";
import styles from "./View.module.css";

type MergeViewProps = { step: Step<MergeState>; input: MergeInput };

const MAX = 20;
const ROW = 36;

const pct = (value: number) => `${(value / MAX) * 100}%`;
const span = (start: number, end: number) => ({ "--left": pct(start), "--width": pct(end - start) }) as CSSProperties;

/**
 * docs/patterns/15-intervals.md: every interval is a bar on a 0–20 number
 * line in its own row. The sort slides rows into start order; then each bar
 * either stretches the last merged bar (lane below) or starts a new one. A
 * guide from the current bar's start down to the merged lane shows the
 * `start ≤ last end` check.
 */
export function MergeIntervalsView({ step, input }: MergeViewProps) {
  const { items, i, merged, phase, outcomes } = step.state;
  const order = new Map(items.map((item, idx) => [item.id, idx]));
  const currentItem = i !== null && phase !== "done" && phase !== "setup" && phase !== "sort" ? items[i] : null;
  const lastMerged = merged.length > 0 ? merged[merged.length - 1] : null;
  const lanesHeight = input.length * ROW;

  const outcomeLabel = (id: number) => {
    const outcome = outcomes[id];
    if (outcome === "merged") return "→ merged";
    if (outcome === "new") return "→ new";
    if (outcome === "seed") return "→ first";
    return null;
  };

  return (
    <ViewRoot>
      <div className={styles.frame}>
        <div className={styles.axis}>
          {Array.from({ length: MAX + 1 }, (_, tick) => (
            <span key={tick} className={styles.tick} data-major={tick % 5 === 0} style={{ left: pct(tick) }}>
              <span>{tick % 5 === 0 ? tick : ""}</span>
              <span className={styles.tickLine} />
            </span>
          ))}
        </div>

        <div className={styles.lanes} style={{ height: lanesHeight }}>
          {input.map((original) => {
            const item = items.find((candidate) => candidate.id === original.id) ?? original;
            const row = order.get(item.id) ?? 0;
            const isCurrent = currentItem?.id === item.id;
            const label = outcomeLabel(item.id);
            const done = label !== null && !isCurrent;
            return (
              <div key={item.id} className={styles.row} style={{ transform: `translateY(${row * ROW}px)` }}>
                <div
                  className={styles.bar}
                  data-state={isCurrent ? "current" : done ? "past" : "waiting"}
                  style={span(item.start, item.end)}
                >
                  <span className={styles.barLabel}>
                    {item.start}–{item.end}
                  </span>
                </div>
                {label && !isCurrent && (
                  <span
                    className={styles.outcome}
                    data-side={item.end > 13 ? "left" : "right"}
                    style={
                      item.end > 13
                        ? { right: `calc(100% - ${pct(item.start)} + 6px)` }
                        : { left: `calc(${pct(item.end)} + 6px)` }
                    }
                  >
                    {label}
                  </span>
                )}
              </div>
            );
          })}
          {currentItem && lastMerged && (
            <div
              className={styles.guide}
              style={{ left: pct(currentItem.start), top: (order.get(currentItem.id) ?? 0) * ROW + ROW / 2 }}
            />
          )}
        </div>

        <div className={styles.divider}>
          <span>merged</span>
        </div>
        <div className={styles.mergedLane}>
          {merged.length === 0 && <span className={styles.empty}>nothing yet</span>}
          {merged.map((interval, idx) => {
            const growing = idx === merged.length - 1 && phase !== "done";
            return (
              <div
                key={interval.from[0]}
                className={styles.bar}
                data-state={growing ? "range" : "found"}
                style={span(interval.start, interval.end)}
              >
                <span className={styles.barLabel}>
                  {interval.start}–{interval.end}
                  {growing ? "" : " ✓"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Stats
        items={[
          { label: "current", value: currentItem ? `[${currentItem.start}, ${currentItem.end}]` : "—" },
          { label: "last merged", value: lastMerged ? `[${lastMerged.start}, ${lastMerged.end}]` : "—" },
          {
            label: "merged",
            value:
              phase === "done"
                ? merged.map((interval) => `[${interval.start}, ${interval.end}]`).join(" ")
                : merged.length,
            answer: true,
          },
        ]}
      />
    </ViewRoot>
  );
}
