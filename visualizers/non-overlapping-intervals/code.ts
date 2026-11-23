/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 */
export const code: string[] = [
  "function eraseOverlapIntervals(intervals: number[][]): number {", // 0
  "  intervals.sort((a, b) => a[1] - b[1]);", // 1
  "  let lastEnd = intervals[0][1];", // 2
  "  let removed = 0;", // 3
  "  for (let i = 1; i < intervals.length; i++) {", // 4
  "    const [start, end] = intervals[i];", // 5
  "    if (start >= lastEnd) {", // 6
  "      lastEnd = end;", // 7
  "    } else {", // 8
  "      removed++;", // 9
  "    }", // 10
  "  }", // 11
  "  return removed;", // 12
  "}", // 13
];
