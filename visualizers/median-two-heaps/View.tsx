import type { Step } from "../types";
import { Edge, heapIndexToPos, heapPosition, LEVEL_GAP, Node, Stats, Strip, Svg, ViewRoot } from "../kit";
import type { CellState, Point, StripItem } from "../kit";
import type { HeapItem, MedianInput, MedianState } from "./types";
import styles from "./View.module.css";

type MedianViewProps = { step: Step<MedianState>; input: MedianInput };

/** Width of one heap's half of the picture, and the gap between the halves (where the median sits). */
const HALF = 200;
const MIDDLE = 104;
const TOP = 30;

const formatMedian = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

/**
 * docs/patterns/09-heaps.md: the stream on top, and the two heaps drawn in
 * one SVG (lower half on the left, upper half on the right) so a value that
 * moves between them glides across. The median sits between the two tops.
 */
export function MedianTwoHeapsView({ step, input }: MedianViewProps) {
  const { stream, index, low, high, moving, phase, medians } = step.state;
  // The lower heap holds at most half the stream (rounded up), plus one for
  // the moment between pushing a number and moving its top across.
  const maxHeapSize = Math.ceil(input.length / 2) + 1;
  const levels = Math.floor(Math.log2(maxHeapSize)) + 1;
  const width = HALF * 2 + MIDDLE;
  const height = TOP + (levels - 1) * LEVEL_GAP + 34;

  const place = (side: "low" | "high", k: number): Point => {
    const p = heapPosition(heapIndexToPos(k), HALF, TOP);
    return side === "low" ? p : { x: p.x + HALF + MIDDLE, y: p.y };
  };

  const heapNodes = (side: "low" | "high", heap: HeapItem[]) =>
    heap.map((item, k) => {
      const state: CellState = item.id === moving ? "current" : k === 0 ? "range" : "waiting";
      return <Node key={item.id} at={place(side, k)} label={item.value} state={state} />;
    });

  const heapEdges = (side: "low" | "high", heap: HeapItem[]) =>
    heap.slice(1).map((item, offset) => {
      const k = offset + 1;
      return <Edge key={`${side}-${item.id}`} from={place(side, Math.floor((k - 1) / 2))} to={place(side, k)} />;
    });

  const items: StripItem[] = stream.map((value, idx) => ({
    key: idx,
    value,
    state: idx === index && phase !== "done" ? "current" : idx < index || phase === "done" ? "past" : "waiting",
    tags: idx === index && phase !== "done" ? [{ label: "next", tone: "orange" }] : [],
  }));

  const median = medians.length > 0 ? medians[medians.length - 1] : null;
  const showMedian = median !== null && (phase === "median" || phase === "done");

  return (
    <ViewRoot>
      <Strip items={items} />
      <div className={styles.heaps}>
        <div className={styles.heads}>
          <span className={styles.head} data-tone="lilac">
            lower half · max-heap
          </span>
          <span className={styles.head} data-tone="mint">
            upper half · min-heap
          </span>
        </div>
        <Svg width={width} height={height}>
          {heapEdges("low", low)}
          {heapEdges("high", high)}
          {heapNodes("low", low)}
          {heapNodes("high", high)}
          {low.length === 0 && (
            <text className={styles.empty} x={HALF / 2} y={TOP}>
              empty
            </text>
          )}
          {high.length === 0 && (
            <text className={styles.empty} x={HALF * 1.5 + MIDDLE} y={TOP}>
              empty
            </text>
          )}
          {median !== null && (
            <g className={styles.median} data-live={showMedian} transform={`translate(${HALF + MIDDLE / 2}, ${TOP})`}>
              <rect x={-44} y={-16} width={88} height={32} rx={10} />
              <text>median {formatMedian(median)}</text>
            </g>
          )}
        </Svg>
      </div>
      <Stats
        items={[
          { label: "lower size", value: low.length },
          { label: "upper size", value: high.length },
          { label: "median", value: median === null ? "—" : formatMedian(median), answer: true },
        ]}
      />
    </ViewRoot>
  );
}
