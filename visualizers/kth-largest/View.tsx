import type { Step } from "../types";
import { Chip, Chips, Edge, heapIndexToPos, heapPosition, LEVEL_GAP, Node, Panel, Split, Stats, Strip, Svg, ViewRoot } from "../kit";
import type { CellState, StripItem } from "../kit";
import type { KthLargestInput, KthLargestState } from "./types";
import styles from "./View.module.css";

type KthLargestViewProps = { step: Step<KthLargestState>; input: KthLargestInput };

const WIDTH = 300;
const TOP = 28;

/** The numbers arriving, the min-heap they pass through, and the ones it let go. */
export function KthLargestView({ step, input }: KthLargestViewProps) {
  const { nums, k, index, heap, moving, dropped, phase } = step.state;
  const done = phase === "done";
  // Space for k + 1 items, the most the heap holds, so the picture never changes size.
  const levels = Math.floor(Math.log2(Math.min(input.k, input.nums.length) + 1)) + 1;
  const height = TOP + (levels - 1) * LEVEL_GAP + 34;
  const place = (at: number) => heapPosition(heapIndexToPos(at), WIDTH, TOP);

  const items: StripItem[] = nums.map((value, idx) => ({
    key: idx,
    value,
    state: idx === index ? "current" : idx < index ? "past" : "waiting",
    tags: idx === index ? [{ label: "next", tone: "orange" }] : [],
  }));

  const stateOf = (at: number, id: number): CellState => {
    if (id === moving) return "current";
    if (at === 0) return done ? "found" : "range";
    return "waiting";
  };

  return (
    <ViewRoot>
      <Strip items={items} />
      <Split>
        <div className={styles.heapWrap}>
          <Svg width={WIDTH} height={height}>
            {heap.slice(1).map((item, offset) => (
              <Edge key={`edge-${offset + 1}`} from={place(Math.floor(offset / 2))} to={place(offset + 1)} />
            ))}
            {heap.map((item, at) => (
              <Node key={item.id} at={place(at)} label={item.value} state={stateOf(at, item.id)} />
            ))}
          </Svg>
        </div>
        <div className={styles.side}>
          <Panel title="dropped">
            <Chips empty="none yet">
              {dropped.map((value, idx) => (
                <Chip key={idx} state="past">
                  {value}
                </Chip>
              ))}
            </Chips>
          </Panel>
        </div>
      </Split>
      <Stats
        items={[
          { label: "k", value: k },
          { label: "heap size", value: heap.length },
          { label: done ? "answer" : "top now", value: heap[0]?.value ?? "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
