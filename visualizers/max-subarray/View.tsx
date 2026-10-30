import type { Step } from "../types";
import { Stats, Strip, ViewRoot, type StripItem } from "../kit";
import type { MaxSubarrayInput, MaxSubarrayState } from "./types";

type MaxSubarrayViewProps = { step: Step<MaxSubarrayState>; input: MaxSubarrayInput };

/** The numbers with the running stretch as a capsule; the best stretch is ticked at the end. */
export function MaxSubarrayView({ step }: MaxSubarrayViewProps) {
  const { nums, i, start, sum, best, bestRange, phase } = step.state;
  const done = phase === "done";

  const items: StripItem[] = nums.map((value, idx) => {
    const inBest = bestRange !== null && idx >= bestRange.start && idx <= bestRange.end;
    return {
      key: idx,
      value,
      above: idx,
      state: done ? (inBest ? "found" : "past") : idx === i ? "current" : idx < start ? "past" : "waiting",
      tags: !done && idx === i ? [{ label: "i", tone: "orange" }] : [],
    };
  });

  return (
    <ViewRoot>
      <Strip items={items} capsule={!done && i >= 0 && start <= i ? { start, end: i } : null} />
      <Stats
        items={[
          { label: "number", value: i >= 0 && !done ? nums[i] : "—" },
          { label: "run sum", value: i >= 0 ? sum : "—" },
          { label: "best", value: best ?? "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
