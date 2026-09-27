/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/09-heaps.md.
 */
export const code: string[] = [
  "class MedianFinder {", // 0
  "  low = new MaxHeap();  // smaller half", // 1
  "  high = new MinHeap(); // larger half", // 2
  "", // 3
  "  addNum(num: number) {", // 4
  "    this.low.push(num);", // 5
  "    this.high.push(this.low.pop());", // 6
  "    if (this.high.size() > this.low.size()) {", // 7
  "      this.low.push(this.high.pop());", // 8
  "    }", // 9
  "  }", // 10
  "", // 11
  "  findMedian(): number {", // 12
  "    if (this.low.size() > this.high.size()) return this.low.peek();", // 13
  "    return (this.low.peek() + this.high.peek()) / 2;", // 14
  "  }", // 15
  "}", // 16
];
