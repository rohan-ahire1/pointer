import type { Step } from "../types";
import { Chip, Chips, Panel, Stats, Strip, ViewRoot, type StripItem } from "../kit";
import type { SubarraySumInput, SubarraySumState } from "./types";
import styles from "./View.module.css";

type SubarraySumViewProps = { step: Step<SubarraySumState>; input: SubarraySumInput };

/** The numbers with the running total under each, and the map of totals seen so far. */
export function SubarraySumView({ step }: SubarraySumViewProps) {
  const { nums, k, i, prefix, need, hits, count, seen, prefixes, found, phase } = step.state;
  const run = found[0] ?? null;
  const inRun = (idx: number) => found.some(([a, b]) => idx >= a && idx <= b);

  const items: StripItem[] = nums.map((value, idx) => ({
    key: idx,
    value,
    above: idx,
    state: inRun(idx) ? "found" : idx === i && phase !== "done" ? "current" : idx < prefixes.length ? "done" : "waiting",
    tags: idx === i && phase !== "done" ? [{ label: "x", tone: "orange" }] : [],
  }));

  const sums: StripItem[] = nums.map((_, idx) => ({
    key: idx,
    value: idx < prefixes.length ? prefixes[idx] : "",
    state: idx === i && phase !== "done" ? "current" : idx < prefixes.length ? "waiting" : "past",
  }));

  const probe =
    phase === "look" && need !== null ? (
      <span className={styles.probe} data-hit={hits ? "yes" : "no"}>
        need {need}? {hits ? `✓ ×${hits}` : "✕"}
      </span>
    ) : null;

  return (
    <ViewRoot>
      <Strip items={items} capsule={run ? { start: run[0], end: run[1] } : null} />
      <p className={styles.label}>prefix sum after each number</p>
      <Strip items={sums} />
      <Panel title="map · prefix sum → times seen" aside={probe}>
        <Chips>
          {seen.map((entry) => (
            <Chip key={entry.sum} state={phase === "look" && hits && entry.sum === need ? "found" : "waiting"}>
              {entry.sum} ×{entry.times}
            </Chip>
          ))}
        </Chips>
      </Panel>
      <Stats
        items={[
          { label: "prefix", value: phase === "setup" ? 0 : prefix },
          { label: "need", value: need === null || phase === "done" ? "—" : `${prefix} − ${k} = ${need}` },
          { label: "count", value: count, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
