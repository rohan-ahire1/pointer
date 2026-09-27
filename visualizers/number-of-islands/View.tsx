import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Chip, Chips, Fit, Panel, Stats, ViewRoot } from "../kit";
import type { Cell, IslandsInput, IslandsState } from "./types";
import styles from "./View.module.css";

type IslandsViewProps = { step: Step<IslandsState>; input: IslandsInput };

const same = (a: Cell | null, r: number, c: number) => a !== null && a[0] === r && a[1] === c;
const has = (cells: readonly Cell[], r: number, c: number) => cells.some((cell) => same(cell, r, c));

/**
 * docs/patterns/11-graphs.md: the grid with water (≈), unclaimed land (▲),
 * queued cells (…), the cell being explored, and claimed land showing its
 * island number. The queue runs underneath, front on the left.
 */
export function NumberOfIslandsView({ step }: IslandsViewProps) {
  const { land, owner, queue, current, scan, justAdded, islands, phase } = step.state;
  const cols = land[0]?.length ?? 0;
  const claimed = owner.flat().filter((value) => value !== null).length;

  const cellFor = (r: number, c: number) => {
    const island = owner[r][c];
    let state: string;
    let glyph: string;
    if (!land[r][c]) {
      state = "water";
      glyph = "≈";
    } else if (same(current, r, c) && phase !== "done") {
      state = "current";
      glyph = island !== null ? String(island) : "▲";
    } else if (has(queue, r, c)) {
      state = "queued";
      glyph = "…";
    } else if (island !== null) {
      state = "claimed";
      glyph = String(island);
    } else {
      state = "land";
      glyph = "▲";
    }
    return (
      <div
        key={`${r}-${c}`}
        className={styles.cell}
        data-state={state}
        data-pulse={has(justAdded, r, c)}
        data-scan={same(scan, r, c) && phase !== "done"}
      >
        {glyph}
        {same(scan, r, c) && phase !== "done" && <span className={styles.scanTag}>scan</span>}
      </div>
    );
  };

  return (
    <ViewRoot>
      <Fit n={cols}>
        <div className={styles.grid} style={{ "--cols": cols } as CSSProperties}>
          {land.map((row, r) => row.map((_, c) => cellFor(r, c)))}
        </div>
      </Fit>
      <Panel title="queue · front first">
        <Chips empty="empty">
          {queue.map(([r, c]) => (
            <Chip key={`${r}-${c}`} state="range">
              ({r}, {c})
            </Chip>
          ))}
        </Chips>
      </Panel>
      <Stats
        items={[
          { label: "queue", value: queue.length },
          { label: "claimed", value: claimed },
          { label: "islands", value: islands, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
