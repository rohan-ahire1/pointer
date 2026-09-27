import type { Step } from "../types";
import { Stats, Strip, ViewRoot, type PointerTag, type StripItem } from "../kit";
import type { FindMinInput, FindMinState } from "./types";
import styles from "./View.module.css";

type FindMinViewProps = { step: Step<FindMinState>; input: FindMinInput };

/**
 * docs/patterns/05-binary-search.md: the capsule is the search space and
 * shrinks by half each decision; everything outside it is ruled out. The
 * halving trail under the strip is the O(log n) story in numbers.
 */
export function FindMinRotatedView({ step }: FindMinViewProps) {
  const { nums, lo, hi, mid, phase, compare, sizes, answer } = step.state;
  const done = phase === "done";

  const items: StripItem[] = nums.map((value, idx) => {
    const tags: PointerTag[] = [];
    if (idx === lo) tags.push({ label: "lo", tone: "inverse" });
    if (idx === mid && !done) tags.push({ label: "mid", tone: "orange" });
    if (idx === hi && !(done && hi === lo)) tags.push({ label: "hi", tone: "lilac" });
    const out = idx < lo || idx > hi;
    return {
      key: idx,
      value,
      above: idx,
      state: done && idx === lo ? "found" : out ? "past" : idx === mid ? "current" : "waiting",
      tags,
    };
  });

  const showCompare = mid !== null && compare !== null && !done;

  return (
    <ViewRoot>
      <div className={styles.compareRow}>
        {showCompare ? (
          <span className={styles.compare}>
            nums[mid] {nums[mid]} {compare === ">" ? ">" : "≤"} {nums[hi]} nums[hi]
          </span>
        ) : (
          <span className={styles.compareIdle}>{done ? `lo = hi = ${lo}` : "compare mid with hi"}</span>
        )}
      </div>
      <Strip items={items} capsule={done ? { start: lo, end: lo } : { start: lo, end: hi }} tagRows={2} />
      <div className={styles.trail}>
        <span className={styles.trailLabel}>search space</span>
        {sizes.map((size, idx) => (
          <span key={idx} className={styles.trailItem} data-last={idx === sizes.length - 1}>
            {idx > 0 && <span className={styles.arrow}>→</span>}
            {size}
          </span>
        ))}
      </div>
      <Stats
        items={[
          { label: "search space", value: hi - lo + 1 },
          { label: "mid value", value: mid !== null && !done ? nums[mid] : "—" },
          { label: "minimum", value: answer ?? "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
