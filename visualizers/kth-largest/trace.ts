import type { Step } from "../types";
import type { HeapItem, KthLargestInput, KthLargestState } from "./types";

/**
 * Keep only the k largest seen so far in a min-heap, so the smallest of them
 * sits on top and is the first to go. Every swap of the real heap is a step.
 */
export function trace({ nums, k }: KthLargestInput): Step<KthLargestState>[] {
  const heap: HeapItem[] = [];
  const dropped: number[] = [];
  const steps: Step<KthLargestState>[] = [];
  const push = (
    index: number,
    moving: number | null,
    phase: KthLargestState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { nums, k, index, heap: heap.map((item) => ({ ...item })), moving, dropped: [...dropped], phase }, lines, note, sr });
  };

  push(-1, null, "setup", [1], `The heap keeps the ${k} largest so far. Its top is the smallest of those.`, `Finding number ${k} from the top among ${nums.length} numbers.`);

  nums.forEach((value, index) => {
    const item = { id: index, value };
    heap.push(item);
    push(index, item.id, "push", [2, 3], `Add ${value} at the bottom of the heap.`, `Pushed ${value}. Heap size ${heap.length}.`);

    let at = heap.length - 1;
    while (at > 0) {
      const parent = Math.floor((at - 1) / 2);
      if (heap[parent].value <= heap[at].value) break;
      [heap[parent], heap[at]] = [heap[at], heap[parent]];
      push(index, item.id, "up", [3], `${value} is smaller than ${heap[at].value}, so it moves up.`, `Swapped ${value} up.`);
      at = parent;
    }

    if (heap.length > k) {
      const top = heap[0];
      dropped.push(top.value);
      const last = heap.pop() as HeapItem;
      if (heap.length > 0) heap[0] = last;
      push(index, heap.length > 0 ? last.id : null, "pop", [4], `That’s ${k + 1} numbers. Drop the smallest, ${top.value}, and move the last one to the top.`, `Dropped ${top.value}. Heap size ${heap.length}.`);

      let down = 0;
      for (;;) {
        const left = 2 * down + 1;
        const right = left + 1;
        let smallest = down;
        if (left < heap.length && heap[left].value < heap[smallest].value) smallest = left;
        if (right < heap.length && heap[right].value < heap[smallest].value) smallest = right;
        if (smallest === down) break;
        [heap[smallest], heap[down]] = [heap[down], heap[smallest]];
        push(index, last.id, "down", [4], `${last.value} is bigger than ${heap[down].value}, so it sinks.`, `Swapped ${last.value} down.`);
        down = smallest;
      }
    }
  });

  push(nums.length, null, "done", [6], `Done. The top of the heap, ${heap[0].value}, is number ${k} from the top.`, `Done. The answer is ${heap[0].value}.`);
  return steps;
}
