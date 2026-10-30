import type { Step } from "../types";
import { Panel, Stats, Strip, ViewRoot, type StripItem } from "../kit";
import type { ProductInput, ProductState } from "./types";

type ProductViewProps = { step: Step<ProductState>; input: ProductInput };

/**
 * The numbers with a capsule around whatever the running product covers, and
 * the output filling in underneath: yellow after the left sweep, ticked after
 * the right one.
 */
export function ProductExceptSelfView({ step }: ProductViewProps) {
  const { nums, out, i, left, right, phase } = step.state;

  const capsule =
    phase === "left" && i > 0
      ? { start: 0, end: i - 1 }
      : phase === "right" && i < nums.length - 1
        ? { start: i + 1, end: nums.length - 1 }
        : null;

  const numItems: StripItem[] = nums.map((value, idx) => ({
    key: idx,
    value,
    above: idx,
    state: idx === i ? "current" : "waiting",
    tags: idx === i ? [{ label: "i", tone: "orange" }] : [],
  }));

  const finished = (idx: number) => phase === "done" || (phase === "right" && idx > i);
  const filled = (idx: number) => phase === "right" || (phase === "left" && idx < i);
  const outItems: StripItem[] = out.map((value, idx) => ({
    key: idx,
    value,
    state: idx === i ? "current" : finished(idx) ? "found" : filled(idx) ? "range" : "waiting",
  }));

  return (
    <ViewRoot>
      <Strip items={numItems} capsule={capsule} />
      <Panel title="out">
        <Strip items={outItems} tagRows={0} />
      </Panel>
      <Stats
        items={[
          { label: "left", value: left },
          { label: "right", value: right },
          { label: "sweep", value: phase === "left" ? "→" : phase === "right" ? "←" : "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
