export const code: string[] = [
  "function findKthLargest(nums: number[], k: number): number {", // 0
  "  const heap = new MinHeap();", // 1
  "  for (const n of nums) {", // 2
  "    heap.push(n);", // 3
  "    if (heap.size() > k) heap.pop();", // 4
  "  }", // 5
  "  return heap.peek();", // 6
  "}", // 7
];
