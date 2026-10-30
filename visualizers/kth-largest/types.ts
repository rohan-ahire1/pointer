export type KthLargestInput = { nums: number[]; k: number };

export type HeapItem = { id: number; value: number };

export type KthLargestState = {
  nums: number[];
  k: number;
  index: number;
  /** A min-heap as an array: index 0 is the smallest. */
  heap: HeapItem[];
  moving: number | null;
  dropped: number[];
  phase: "setup" | "push" | "up" | "pop" | "down" | "done";
};
