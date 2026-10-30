import type { Step } from "../types";
import { Chip, Chips, list, Panel, Stats, Strip, ViewRoot, type PointerTag, type StripItem } from "../kit";
import type { ThreeSumInput, ThreeSumState } from "./types";

type ThreeSumViewProps = { step: Step<ThreeSumState>; input: ThreeSumInput };

/** The sorted numbers with `i` anchored and `l` and `r` closing in, and the trios found so far. */
export function ThreeSumView({ step }: ThreeSumViewProps) {
  const { nums, i, l, r, sum, found, phase } = step.state;

  const items: StripItem[] = nums.map((value, idx) => {
    const tags: PointerTag[] = [];
    if (idx === i) tags.push({ label: "i", tone: "inverse" });
    if (idx === l) tags.push({ label: "l", tone: "orange" });
    if (idx === r) tags.push({ label: "r", tone: "lilac" });
    const onTrio = phase === "hit" && (idx === i || idx === l || idx === r);
    const state = onTrio ? "found" : idx === l || idx === r ? "current" : idx === i ? "range" : idx < i ? "past" : "waiting";
    return { key: idx, value, above: idx, state, tags };
  });

  return (
    <ViewRoot>
      <Strip items={items} />
      <Panel title="trios found">
        <Chips empty="none yet">
          {found.map((trio) => (
            <Chip key={trio.join(",")} state="found">
              {list(trio)}
            </Chip>
          ))}
        </Chips>
      </Panel>
      <Stats
        items={[
          { label: "fixed", value: i >= 0 ? nums[i] : "—" },
          { label: "sum", value: sum ?? "—" },
          { label: "trios", value: found.length, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
