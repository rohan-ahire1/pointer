/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from design/visualizer-spec.md.
 */
export const code: string[] = [
  "function longest(s: string): number {", // 0
  "  const seen = new Set<string>();", // 1
  "  let left = 0, best = 0;", // 2
  "", // 3
  "  for (let r = 0; r < s.length; r++) {", // 4
  "    while (seen.has(s[r])) {", // 5
  "      seen.delete(s[left]);", // 6
  "      left++;", // 7
  "    }", // 8
  "    seen.add(s[r]);", // 9
  "    best = Math.max(best, r - left + 1);", // 10
  "  }", // 11
  "  return best;", // 12
  "}", // 13
];
