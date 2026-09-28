/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/15-intervals.md.
 */
export const code: string[] = [
  "function merge(intervals: number[][]): number[][] {", // 0
  "  intervals.sort((a, b) => a[0] - b[0]);", // 1
  "  const merged: number[][] = [intervals[0]];", // 2
  "  for (let i = 1; i < intervals.length; i++) {", // 3
  "    const last = merged[merged.length - 1];", // 4
  "    const [start, end] = intervals[i];", // 5
  "    if (start <= last[1]) {", // 6
  "      last[1] = Math.max(last[1], end);", // 7
  "    } else {", // 8
  "      merged.push([start, end]);", // 9
  "    }", // 10
  "  }", // 11
  "  return merged;", // 12
  "}", // 13
];
