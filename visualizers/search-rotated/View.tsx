import type { Step } from "../types";
import { Stats, Strip, ViewRoot, type PointerTag, type StripItem } from "../kit";
import type { SearchRotatedInput, SearchRotatedState } from "./types";

type SearchRotatedViewProps = { step: Step<SearchRotatedState>; input: SearchRotatedInput };

/** The list with the search range as a capsule; the half that's in order gets a stronger fill. */
export function SearchRotatedView({ step }: SearchRotatedViewProps) {
  const { nums, target, lo, hi, mid, sorted, answer, phase } = step.state;
  const done = phase === "done";

  const inSorted = (idx: number) => {
    if (mid === null || sorted === null) return false;
    return sorted === "left" ? idx >= lo && idx <= mid : idx >= mid && idx <= hi;
  };

  const items: StripItem[] = nums.map((value, idx) => {
    const tags: PointerTag[] = [];
    if (!done && idx === lo) tags.push({ label: "lo", tone: "inverse" });
    if (!done && idx === hi) tags.push({ label: "hi", tone: "lilac" });
    if (!done && idx === mid) tags.push({ label: "mid", tone: "orange" });
    const state =
      answer === idx ? "found" : idx === mid && !done ? "current" : idx < lo || idx > hi ? "past" : inSorted(idx) ? "range" : "waiting";
    return { key: idx, value, above: idx, state, tags };
  });

  return (
    <ViewRoot>
      <Strip items={items} tagRows={2} capsule={!done && lo <= hi ? { start: lo, end: hi } : null} />
      <Stats
        items={[
          { label: "target", value: target },
          { label: "in order", value: sorted ?? "—" },
          { label: "index", value: answer ?? "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
