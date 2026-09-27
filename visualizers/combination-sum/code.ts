/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/10-backtracking.md.
 */
export const code: string[] = [
  "function combinationSum(candidates: number[], target: number): number[][] {", // 0
  "  const result: number[][] = [];", // 1
  "  const path: number[] = [];", // 2
  "  candidates.sort((a, b) => a - b);", // 3
  "  function dfs(start: number, remaining: number) {", // 4
  "    if (remaining === 0) {", // 5
  "      result.push([...path]);", // 6
  "      return;", // 7
  "    }", // 8
  "    for (let i = start; i < candidates.length; i++) {", // 9
  "      if (candidates[i] > remaining) break;", // 10
  "      path.push(candidates[i]);", // 11
  "      dfs(i, remaining - candidates[i]);", // 12
  "      path.pop();", // 13
  "    }", // 14
  "  }", // 15
  "  dfs(0, target);", // 16
  "  return result;", // 17
  "}", // 18
];
