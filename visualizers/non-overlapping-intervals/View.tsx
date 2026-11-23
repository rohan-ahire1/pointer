import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Stats, ViewRoot } from "../kit";
import type { NonOverlappingInput, NonOverlappingState } from "./types";
import styles from "./View.module.css";

type ViewProps = { step: Step<NonOverlappingState>; input: NonOverlappingInput };

const MAX = 20;
const ROW = 36;

const pct = (value: number) => `${(value / MAX) * 100}%`;
const span = (start: number, end: number) => ({ "--left": pct(start), "--width": pct(end - start) }) as CSSProperties;

/**
 * Every interval is a bar on a 0–20 number line in its own row. The sort
 * slides rows into end order; then each bar is checked against a marker at
 * the last kept end. Kept bars stay solid and green with a ✓; removed bars
 * turn dashed and faint with a ✕.
 */
export function NonOverlappingIntervalsView({ step, input }: ViewProps) {
  const { items, i, lastEnd, removed, phase, outcomes } = step.state;
  const order = new Map(items.map((item, idx) => [item.id, idx]));
  const currentItem = i !== null && phase !== "done" && phase !== "setup" && phase !== "sort" ? items[i] : null;

  const outcomeLabel = (id: number) => {
    const outcome = outcomes[id];
    if (outcome === "removed") return "✕ removed";
    if (outcome === "kept") return "✓ kept";
    if (outcome === "seed") return "✓ first";
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

        <div className={styles.lanes} style={{ height: input.length * ROW }}>
          {input.map((original) => {
            const item = items.find((candidate) => candidate.id === original.id) ?? original;
            const row = order.get(item.id) ?? 0;
            const isCurrent = currentItem?.id === item.id;
            const outcome = outcomes[item.id];
            const label = outcomeLabel(item.id);
            const state = isCurrent ? "current" : outcome === "removed" ? "removed" : outcome ? "kept" : "waiting";
            const flip = item.end > 13;
            return (
              <div key={item.id} className={styles.row} style={{ transform: `translateY(${row * ROW}px)` }}>
                <div className={styles.bar} data-state={state} style={span(item.start, item.end)}>
                  <span className={styles.barLabel}>
                    {item.start}–{item.end}
                  </span>
                </div>
                {label && !isCurrent && (
                  <span
                    className={styles.outcome}
                    style={
                      flip
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
          {lastEnd !== null && (
            <div className={styles.marker} style={{ left: pct(lastEnd) }}>
              <span className={styles.markerLabel}>last end {lastEnd}</span>
            </div>
          )}
        </div>
      </div>
      <Stats
        items={[
          { label: "current", value: currentItem ? `[${currentItem.start}, ${currentItem.end}]` : "—" },
          { label: "last end", value: lastEnd ?? "—" },
          { label: "removed", value: removed, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
