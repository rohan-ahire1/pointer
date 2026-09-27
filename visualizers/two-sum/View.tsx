import type { Step } from "../types";
import { Chip, Chips, Panel, Split, Stats, Strip, ViewRoot, type StripItem } from "../kit";
import type { TwoSumInput, TwoSumState } from "./types";
import styles from "./View.module.css";

type TwoSumViewProps = { step: Step<TwoSumState>; input: TwoSumInput };

/**
 * docs/patterns/01-arrays-and-hashing.md: the array with `i` walking it, and
 * the map beside it. Each lookup shows a probe chip ("need 2?") that either
 * lights up the matching entry or is added as a new one.
 */
export function TwoSumView({ step }: TwoSumViewProps) {
  const { nums, i, need, map, lookup, answer, phase } = step.state;
  const pair = answer ? new Set(answer) : null;

  const items: StripItem[] = nums.map((value, idx) => {
    const found = pair?.has(idx) ?? false;
    const isEarlier = found && idx === answer?.[0];
    return {
      key: idx,
      value,
      above: idx,
      state: found ? "found" : idx === i ? "current" : "waiting",
      tags: isEarlier ? [{ label: "seen", tone: "inverse" }] : idx === i ? [{ label: "i", tone: "orange" }] : [],
    };
  });

  const probe =
    need === null || phase === "setup" || phase === "done" ? null : (
      <span className={styles.probe} data-lookup={lookup}>
        need {need}? {lookup === "hit" ? "✓ found" : lookup === "miss" ? "✕ not yet" : ""}
      </span>
    );

  return (
    <ViewRoot>
      <Split>
        <Strip items={items} />
        <div className={styles.mapWrap}>
          <Panel title="map · value → index" aside={probe}>
            <Chips empty="empty">
              {map.map((entry) => (
                <Chip key={entry.value} state={lookup === "hit" && entry.value === need ? "found" : "waiting"}>
                  {entry.value} → {entry.index}
                  {lookup === "hit" && entry.value === need ? " ✓" : ""}
                </Chip>
              ))}
            </Chips>
          </Panel>
        </div>
      </Split>
      <Stats
        items={[
          { label: "nums[i]", value: i >= 0 && phase !== "done" ? nums[i] : "—" },
          { label: "need", value: need ?? "—" },
          {
            label: "pair",
            value: answer ? `[${answer[0]}, ${answer[1]}]` : phase === "done" ? "none" : "—",
            answer: true,
          },
        ]}
      />
    </ViewRoot>
  );
}
