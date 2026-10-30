import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Stats, ViewRoot } from "../kit";
import type { UniquePathsInput, UniquePathsState } from "./types";
import styles from "./View.module.css";

type UniquePathsViewProps = { step: Step<UniquePathsState>; input: UniquePathsInput };

/** The grid filling in row by row, with the two cells each sum reads from picked out. */
export function UniquePathsView({ step }: UniquePathsViewProps) {
  const { m, n, dp, r, c, phase } = step.state;
  const done = phase === "done";

  const stateOf = (row: number, col: number): string => {
    if (done && row === r && col === c) return "found";
    if (phase === "cell") {
      if (row === r && col === c) return "current";
      if ((row === r - 1 && col === c) || (row === r && col === c - 1)) return "source";
    }
    return dp[row][col] === null ? "empty" : "filled";
  };

  return (
    <ViewRoot>
      <div className={styles.grid} style={{ "--cols": n } as CSSProperties}>
        {dp.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className={styles.cell} data-state={stateOf(rowIndex, colIndex)}>
              {value ?? ""}
            </div>
          )),
        )}
      </div>
      <Stats
        items={[
          { label: "rows", value: m },
          { label: "columns", value: n },
          { label: "paths", value: done ? (dp[r][c] ?? "—") : "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
