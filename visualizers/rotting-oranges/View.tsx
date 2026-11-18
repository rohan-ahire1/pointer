import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Chip, Chips, Fit, Panel, Stats, ViewRoot } from "../kit";
import type { Cell, OrangesInput, OrangesState } from "./types";
import styles from "./View.module.css";

type OrangesViewProps = { step: Step<OrangesState>; input: OrangesInput };

const same = (a: Cell | null, r: number, c: number) => a !== null && a[0] === r && a[1] === c;
const has = (cells: readonly Cell[], r: number, c: number) => cells.some((cell) => same(cell, r, c));

/**
 * The grid: empty cells dashed, fresh oranges as ●, rotten ones showing the minute
 * they went bad. The queue underneath splits into this minute and the next.
 */
export function RottingOrangesView({ step }: OrangesViewProps) {
  const { grid, rotAt, queue, front, current, justRotted, fresh, minutes, answer, phase } = step.state;
  const cols = grid[0]?.length ?? 0;
  const thisMinute = queue.slice(0, front);
  const nextMinute = queue.slice(front);

  const cellFor = (r: number, c: number) => {
    const v = grid[r][c];
    const state = v === 0 ? "empty" : v === 1 ? "fresh" : same(current, r, c) ? "current" : "rotten";
    return (
      <div key={`${r}-${c}`} className={styles.cell} data-state={state} data-pulse={has(justRotted, r, c)}>
        {v === 1 ? "●" : v === 2 ? rotAt[r][c] : ""}
      </div>
    );
  };

  const chip = ([r, c]: Cell, state: "range" | "waiting") => (
    <Chip key={`${r}-${c}`} state={state}>
      ({r}, {c})
    </Chip>
  );

  return (
    <ViewRoot>
      <Fit n={cols}>
        <div className={styles.grid} style={{ "--cols": cols } as CSSProperties}>
          {grid.map((row, r) => row.map((_, c) => cellFor(r, c)))}
        </div>
      </Fit>
      <p className={styles.key}>● fresh · a number is the minute it went bad</p>
      <Panel title="queue · front first" aside={phase === "spread" ? <span className={styles.aside}>minute {minutes + 1}</span> : undefined}>
        <Chips empty="empty">
          {[
            ...thisMinute.map((cell) => chip(cell, "range")),
            ...(thisMinute.length && nextMinute.length ? [<span key="sep" className={styles.sep}>next minute:</span>] : []),
            ...nextMinute.map((cell) => chip(cell, "waiting")),
          ]}
        </Chips>
      </Panel>
      <Stats
        items={[
          { label: "fresh", value: fresh },
          { label: "minutes", value: minutes },
          { label: "answer", value: answer ?? "…", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
