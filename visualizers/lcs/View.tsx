import type { CSSProperties, ReactNode } from "react";
import type { Step } from "../types";
import { Chip, Chips, Fit, Stats, ViewRoot } from "../kit";
import type { LcsInput, LcsState } from "./types";
import styles from "./View.module.css";

type LcsViewProps = { step: Step<LcsState>; input: LcsInput };

/**
 * docs/patterns/13-2-d-dp.md: the table with `b` across the top and `a` down
 * the side. The cell being filled is lifted; its sources light up (↖ +1 for a
 * match, ↑ and ← for a carry, the winner ticked). Match cells keep a corner
 * mark. At the end the trace-back path is ringed and the letters it used get ✓.
 */
export function LcsView({ step }: LcsViewProps) {
  const { a, b, dp, i, j, kind, from, path, subsequence, phase } = step.state;
  const filling = phase === "fill" && i !== null && j !== null;
  const onPath = new Set((path ?? []).map(([r, c]) => `${r},${c}`));
  // A cell on the trace-back path where the letters matched contributes a letter.
  const usedA = new Set<number>();
  const usedB = new Set<number>();
  for (const [r, c] of path ?? []) {
    if (r > 0 && c > 0 && a[r - 1] === b[c - 1]) {
      usedA.add(r - 1);
      usedB.add(c - 1);
    }
  }

  const sourceMark = (r: number, c: number): string | null => {
    if (!filling) return null;
    if (kind === "match" && r === i! - 1 && c === j! - 1) return "↖ +1";
    if (kind === "carry" && r === i! - 1 && c === j!) return from === "up" ? "↑ ✓" : "↑";
    if (kind === "carry" && r === i! && c === j! - 1) return from === "left" ? "← ✓" : "←";
    return null;
  };

  const cells: ReactNode[] = [];
  const header = (key: string, text: string, state: string) => (
    <div key={key} className={styles.head} data-state={state}>
      {text}
    </div>
  );

  cells.push(<div key="corner" />);
  cells.push(header("h-empty", "", "idle"));
  b.split("").forEach((ch, c) =>
    cells.push(
      header(
        `hb${c}`,
        ch,
        filling && c === j! - 1
          ? "current"
          : phase === "traceback" || phase === "done"
            ? usedB.has(c)
              ? "used"
              : "idle"
            : "idle",
      ),
    ),
  );
  for (let r = 0; r <= a.length; r++) {
    cells.push(
      r === 0
        ? header("ha-empty", "", "idle")
        : header(
            `ha${r}`,
            a[r - 1],
            filling && r === i
              ? "current"
              : phase === "traceback" || phase === "done"
                ? usedA.has(r - 1)
                  ? "used"
                  : "idle"
                : "idle",
          ),
    );
    for (let c = 0; c <= b.length; c++) {
      const value = dp[r]?.[c];
      const isCurrent = filling && r === i && c === j;
      const mark = sourceMark(r, c);
      const isMatch = r > 0 && c > 0 && value !== null && value !== undefined && a[r - 1] === b[c - 1];
      const state = isCurrent ? "current" : mark ? "source" : isMatch ? "match" : value === null ? "empty" : "filled";
      cells.push(
        <div key={`${r}-${c}`} className={styles.cell} data-state={state} data-path={onPath.has(`${r},${c}`)}>
          {value ?? ""}
          {mark && <span className={styles.mark}>{mark}</span>}
        </div>,
      );
    }
  }

  const answer = phase === "done" || phase === "traceback" ? dp[a.length]?.[b.length] : null;

  return (
    <ViewRoot>
      <Fit n={b.length + 2}>
        <div className={styles.table} style={{ "--cols": b.length + 2 } as CSSProperties}>
          {cells}
        </div>
      </Fit>
      <div className={styles.result}>
        <span className={styles.resultLabel}>subsequence</span>
        <Chips empty={phase === "done" || phase === "traceback" ? "none in common" : "after the table fills"}>
          {subsequence
            ? subsequence.split("").map((ch, idx) => (
                <Chip key={idx} state="found">
                  {ch}
                </Chip>
              ))
            : []}
        </Chips>
      </div>
      <Stats
        items={[
          { label: "comparing", value: filling ? `‘${a[i! - 1]}’ vs ‘${b[j! - 1]}’` : "—" },
          { label: "cell", value: filling ? (dp[i!][j!] ?? "…") : "—" },
          { label: "LCS", value: answer ?? "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
