import type { Step } from "../types";
import type { UniquePathsInput, UniquePathsState } from "./types";

/** You can only arrive from above or from the left, so each cell is the sum of those two. */
export function trace({ m, n }: UniquePathsInput): Step<UniquePathsState>[] {
  const dp: (number | null)[][] = Array.from({ length: m }, (_, r) =>
    Array.from({ length: n }, (_, c) => (r === 0 || c === 0 ? 1 : null)),
  );
  const steps: Step<UniquePathsState>[] = [];
  const push = (r: number, c: number, phase: UniquePathsState["phase"], lines: number[], note: string, sr: string) => {
    steps.push({ state: { m, n, dp: dp.map((row) => [...row]), r, c, phase }, lines, note, sr });
  };

  push(-1, -1, "setup", [1], "The top row and left column have one path each: straight along the edge.", `A grid of ${m} rows and ${n} columns. Edges start at 1.`);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      const above = dp[r - 1][c] as number;
      const left = dp[r][c - 1] as number;
      dp[r][c] = above + left;
      push(r, c, "cell", [3, 4], `${above} ways from above + ${left} from the left = ${above + left}.`, `Row ${r}, column ${c} is ${above + left}.`);
    }
  }
  const answer = dp[m - 1][n - 1] as number;
  push(m - 1, n - 1, "done", [7], `Done. ${answer} ${answer === 1 ? "path reaches" : "paths reach"} the bottom-right corner.`, `Done. The answer is ${answer}.`);
  return steps;
}
