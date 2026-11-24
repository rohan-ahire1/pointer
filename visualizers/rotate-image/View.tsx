import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Cell, Fit, Stats, ViewRoot, type CellState } from "../kit";
import type { RotateInput, RotateState } from "./types";
import styles from "./View.module.css";

type RotateViewProps = { step: Step<RotateState>; input: RotateInput };

const PHASE_LABEL: Record<RotateState["phase"], string> = {
  setup: "ready",
  transpose: "1 · diagonal flip",
  flip: "2 · reverse rows",
  done: "rotated",
};

/** The grid being rotated. The pair just swapped is lifted and carries ⇄; cells already handled turn mint. */
export function RotateImageView({ step }: RotateViewProps) {
  const { matrix, pair, row, swaps, phase } = step.state;
  const n = matrix.length;

  const handled = (r: number, c: number): boolean => {
    if (phase === "done") return true;
    if (phase === "flip") return row !== null && r < row;
    if (phase === "transpose") {
      if (!pair) return true; // The diagonal flip is finished.
      const [[i, j]] = pair;
      const [a, b] = [Math.min(r, c), Math.max(r, c)];
      return r !== c && (a < i || (a === i && b <= j));
    }
    return false;
  };
  const stateOf = (r: number, c: number): CellState => {
    if (pair?.some(([pr, pc]) => pr === r && pc === c)) return "current";
    if (handled(r, c)) return "done";
    if (phase === "flip" && r === row) return "range";
    return "waiting";
  };
  const isSwapped = (r: number, c: number) => pair?.some(([pr, pc]) => pr === r && pc === c) ?? false;

  return (
    <ViewRoot>
      <Fit n={n}>
        <div className={styles.grid} style={{ "--cols": n } as CSSProperties}>
          {matrix.map((rowValues, r) =>
            rowValues.map((value, c) => (
              <div key={`${r}-${c}`} style={{ gridRow: r + 1, gridColumn: c + 1 }}>
                <Cell value={value} state={stateOf(r, c)} size="sm" badge={isSwapped(r, c) ? "⇄" : undefined} />
              </div>
            )),
          )}
        </div>
      </Fit>
      <Stats
        items={[
          { label: "phase", value: PHASE_LABEL[phase] },
          { label: "swaps", value: swaps },
          { label: "row", value: row === null ? "—" : row + 1 },
        ]}
      />
    </ViewRoot>
  );
}
