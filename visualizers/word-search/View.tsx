import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Cell, Fit, Stats, ViewRoot } from "../kit";
import type { Spot, WordSearchInput, WordSearchState } from "./types";
import styles from "./View.module.css";

type WordSearchViewProps = { step: Step<WordSearchState>; input: WordSearchInput };

const isAt = (spot: Spot | null, r: number, c: number) => spot !== null && spot[0] === r && spot[1] === c;

/** The board with the current path numbered in order, and the word filling in above it. */
export function WordSearchView({ step }: WordSearchViewProps) {
  const { board, word, path, dead, starts, found, phase } = step.state;
  const cols = board[0].length;
  const head = path[path.length - 1] ?? null;
  const orderOf = (r: number, c: number) => path.findIndex((spot) => isAt(spot, r, c));

  const stateOf = (r: number, c: number): string => {
    if (isAt(dead, r, c)) return "dead";
    if (orderOf(r, c) === -1) return "open";
    if (found === true) return "found";
    return isAt(head, r, c) ? "current" : "path";
  };

  const wordState = (index: number) => {
    if (index >= path.length) return "waiting";
    if (found === true) return "found";
    return index === path.length - 1 ? "current" : "range";
  };

  return (
    <ViewRoot>
      <Fit n={word.length}>
        <div className={styles.word}>
          {word.split("").map((ch, index) => (
            <Cell key={index} value={ch} state={wordState(index)} />
          ))}
        </div>
      </Fit>
      <div className={styles.board} style={{ "--cols": cols } as CSSProperties}>
        {board.map((row, r) =>
          row.map((ch, c) => {
            const order = orderOf(r, c);
            return (
              <div key={`${r}-${c}`} className={styles.cell} data-state={stateOf(r, c)}>
                {ch}
                {order >= 0 && <span className={styles.order}>{order + 1}</span>}
              </div>
            );
          }),
        )}
      </div>
      <Stats
        items={[
          { label: "matched", value: `${path.length} of ${word.length}` },
          { label: "starts tried", value: starts.length },
          { label: "found?", value: phase !== "done" ? "—" : found ? "yes" : "no", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
