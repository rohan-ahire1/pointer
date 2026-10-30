import type { Step } from "../types";
import { Chip, Chips, Panel, Stats, Strip, ViewRoot, type PointerTag, type StripItem } from "../kit";
import type { MinWindowInput, MinWindowState } from "./types";

type MinWindowViewProps = { step: Step<MinWindowState>; input: MinWindowInput };

/** The string with the window as a capsule, and what the window still has to cover. */
export function MinWindowView({ step }: MinWindowViewProps) {
  const { s, left, right, need, missing, best, phase } = step.state;
  const done = phase === "done";

  const items: StripItem[] = s.split("").map((ch, idx) => {
    const tags: PointerTag[] = [];
    if (!done && idx === left && right >= 0) tags.push({ label: "L", tone: "inverse" });
    if (!done && idx === right) tags.push({ label: "R", tone: "orange" });
    const inBest = done && best !== null && idx >= best.start && idx <= best.end;
    return {
      key: idx,
      value: ch,
      state: inBest ? "found" : !done && idx === right ? "current" : idx < left ? "past" : "waiting",
      tags,
    };
  });

  return (
    <ViewRoot>
      <Strip
        items={items}
        tagRows={2}
        capsule={right >= left && !done ? { start: left, end: right } : null}
      />
      <Panel title="still needed">
        <Chips>
          {need.map(({ ch, count }) => (
            <Chip key={ch} state={count <= 0 ? "found" : "waiting"}>
              {ch} {count <= 0 ? "✓" : `× ${count}`}
            </Chip>
          ))}
        </Chips>
      </Panel>
      <Stats
        items={[
          { label: "window", value: right >= left && !done ? right - left + 1 : "—" },
          { label: "missing", value: missing },
          { label: "shortest", value: best ? s.slice(best.start, best.end + 1) : "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
