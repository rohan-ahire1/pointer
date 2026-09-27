import type { Step } from "../types";
import type { HeapItem, MedianInput, MedianState } from "./types";

/** True when `child` belongs above `parent` in the heap. Strict on ties so the shape is deterministic. */
type Above = (child: number, parent: number) => boolean;

const maxAbove: Above = (child, parent) => child > parent;
const minAbove: Above = (child, parent) => child < parent;

function siftUp(heap: HeapItem[], k: number, above: Above): void {
  while (k > 0) {
    const parent = (k - 1) >> 1;
    if (!above(heap[k].value, heap[parent].value)) break;
    [heap[k], heap[parent]] = [heap[parent], heap[k]];
    k = parent;
  }
}

function siftDown(heap: HeapItem[], k: number, above: Above): void {
  for (;;) {
    const left = 2 * k + 1;
    const right = left + 1;
    let top = k;
    if (left < heap.length && above(heap[left].value, heap[top].value)) top = left;
    if (right < heap.length && above(heap[right].value, heap[top].value)) top = right;
    if (top === k) break;
    [heap[k], heap[top]] = [heap[top], heap[k]];
    k = top;
  }
}

function heapPush(heap: HeapItem[], item: HeapItem, above: Above): void {
  heap.push(item);
  siftUp(heap, heap.length - 1, above);
}

function heapPop(heap: HeapItem[], above: Above): HeapItem {
  const top = heap[0];
  const last = heap.pop();
  if (last === undefined) throw new Error("Cannot pop an empty heap.");
  if (heap.length > 0) {
    heap[0] = last;
    siftDown(heap, 0, above);
  }
  return top;
}

/**
 * Traced Find Median from Data Stream (docs/patterns/09-heaps.md): every
 * arrival lands in the lower half first, the biggest of that half moves
 * across, and the halves rebalance so the median always sits at the tops
 * where they meet. Pure and deterministic.
 */
export function trace(input: MedianInput): Step<MedianState>[] {
  const stream = [...input];
  const out: Step<MedianState>[] = [];
  const low: HeapItem[] = [];
  const high: HeapItem[] = [];
  const medians: number[] = [];
  const push = (
    index: number,
    moving: number | null,
    phase: MedianState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        stream: [...stream],
        index,
        low: low.map((item) => ({ ...item })),
        high: high.map((item) => ({ ...item })),
        moving,
        phase,
        medians: [...medians],
      },
      lines,
      note,
      sr,
    });
  };

  const list = (heap: HeapItem[]): string => heap.map((item) => String(item.value)).join(", ");
  const halvesSr = (): string => {
    const lo = low.length === 0 ? "empty" : `${list(low)}, top ${low[0].value}`;
    const hi = high.length === 0 ? "empty" : `${list(high)}, top ${high[0].value}`;
    return `Lower half ${lo}. Upper half ${hi}.`;
  };

  push(
    -1,
    null,
    "setup",
    [1, 2],
    "Two empty heaps: the lower half on the left, the upper half on the right.",
    `Two empty heaps. ${stream.length} ${stream.length === 1 ? "number" : "numbers"} arriving. No median yet.`,
  );

  for (let i = 0; i < stream.length; i++) {
    const num = stream[i];
    heapPush(low, { id: i, value: num }, maxAbove);
    push(
      i,
      null,
      "push",
      [4, 5],
      `${num} arrives. Drop it into the lower half first.`,
      `${num} arrives into the lower half. ${halvesSr()}`,
    );

    const moved = heapPop(low, maxAbove);
    heapPush(high, moved, minAbove);
    const rebalances = high.length > low.length;
    push(
      i,
      moved.id,
      "moveUp",
      rebalances ? [6] : [6, 7],
      `The biggest of the lower half, ${moved.value}, moves over to the upper half.`,
      `${moved.value} moves to the upper half. ${halvesSr()}`,
    );

    if (rebalances) {
      const back = heapPop(high, minAbove);
      heapPush(low, back, maxAbove);
      push(
        i,
        back.id,
        "rebalance",
        [7, 8],
        `The upper half is bigger now. Its smallest, ${back.value}, moves back down.`,
        `${back.value} moves back down. ${halvesSr()}`,
      );
    }

    const odd = low.length > high.length;
    const median = odd ? low[0].value : (low[0].value + high[0].value) / 2;
    medians.push(median);
    push(
      i,
      null,
      "median",
      odd ? [12, 13] : [12, 14],
      odd
        ? `Median: the lower half is bigger, so its top: ${median}.`
        : `Median: (${low[0].value} + ${high[0].value}) / 2 = ${median}.`,
      odd ? `${halvesSr()} Median ${median}.` : `${halvesSr()} Median (${low[0].value} + ${high[0].value}) / 2 = ${median}.`,
    );
  }

  const odd = low.length > high.length;
  const last = medians[medians.length - 1];
  push(
    stream.length - 1,
    null,
    "done",
    [odd ? 13 : 14],
    `Done. After ${stream.length} ${stream.length === 1 ? "number" : "numbers"} the median is ${last}.`,
    `Done. After ${stream.length} ${stream.length === 1 ? "number" : "numbers"} the median is ${last}. ${halvesSr()}`,
  );
  return out;
}
