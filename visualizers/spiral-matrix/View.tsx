import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Cell, Chip, Chips, Fit, Panel, Stats, ViewRoot, type CellState } from "../kit";
import type { SpiralInput, SpiralState } from "./types";
import styles from "./View.module.css";

type SpiralViewProps = { step: Step<SpiralState>; input: SpiralInput };

/** The grid with a dashed box around what's unread. Read cells carry their reading order in the corner. */
export function SpiralMatrixView({ step }: SpiralViewProps) {
  const { grid, top, bottom, left, right, read, current, side } = step.state;
  const cols = grid[0].length;
  const total = grid.length * cols;
  const open = top <= bottom && left <= right;
  const walls = {
    gridRow: `${top + 1} / ${bottom + 2}`,
    gridColumn: `${left + 1} / ${right + 2}`,
  } satisfies CSSProperties;

  const orderOf = (r: number, c: number) => read.findIndex(([row, col]) => row === r && col === c);
  const stateOf = (r: number, c: number): CellState => {
    if (current?.[0] === r && current[1] === c) return "current";
    return orderOf(r, c) >= 0 ? "done" : "waiting";
  };

  return (
    <ViewRoot>
      <Fit n={cols}>
        <div className={styles.grid} style={{ "--cols": cols } as CSSProperties}>
          {grid.map((row, r) =>
            row.map((value, c) => (
              <div key={`${r}-${c}`} style={{ gridRow: r + 1, gridColumn: c + 1 }}>
                <Cell value={value} state={stateOf(r, c)} size="sm" badge={orderOf(r, c) >= 0 ? orderOf(r, c) + 1 : undefined} />
              </div>
            )),
          )}
          {open && <div className={styles.walls} style={walls} />}
        </div>
      </Fit>
      <Panel title="read so far">
        <Chips empty="nothing yet">
          {read.map(([r, c]) => (
            <Chip key={`${r}-${c}`} state="found">
              {grid[r][c]}
            </Chip>
          ))}
        </Chips>
      </Panel>
      <Stats
        items={[
          { label: "walls", value: `${top} · ${bottom} · ${left} · ${right}` },
          { label: "walking", value: side ?? "—" },
          { label: "read", value: `${read.length} of ${total}`, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
