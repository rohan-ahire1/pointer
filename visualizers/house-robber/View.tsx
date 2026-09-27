import type { Step } from "../types";
import { Cell, Chip, Fit, Stats, ViewRoot, type CellState } from "../kit";
import type { RobberInput, RobberState } from "./types";
import styles from "./View.module.css";

type RobberViewProps = { step: Step<RobberState>; input: RobberInput };

/**
 * docs/patterns/12-1-d-dp.md: houses on top, the dp row underneath (dp[i]
 * sits under house i; dp[0] under the empty lot at the start). While a cell
 * is being decided, its two sources light up and a row of two chips spells
 * out skip vs take; the winner gets a ✓. At the end, the robbed houses are
 * marked. Labels stay one or two characters so eight houses fit at 320px.
 */
export function HouseRobberView({ step }: RobberViewProps) {
  const { nums, dp, i, skip, take, choice, phase, robbed } = step.state;
  const deciding = (phase === "compare" || phase === "decide") && i !== null;
  const robbedSet = new Set(robbed ?? []);
  const last = [...dp].reverse().find((value) => value !== null) ?? 0;

  const houseState = (house: number): CellState => {
    if (phase === "done") return robbedSet.has(house) ? "found" : "waiting";
    if (deciding && house === i! - 1) return "current";
    if (phase === "base" && house === 0) return "current";
    return "waiting";
  };

  const dpState = (k: number): CellState => {
    if (deciding && k === i) return phase === "decide" ? "done" : "range";
    if (deciding && (k === i! - 1 || k === i! - 2)) return "range";
    if (phase === "base" && k === 1) return "done";
    return "waiting";
  };

  const won = phase === "decide" ? choice : null;

  return (
    <ViewRoot>
      <Fit n={nums.length + 1}>
        <div className={styles.rows}>
          <div className={styles.row}>
            <div className={styles.slot}>
              <span className={styles.lot}>∅</span>
            </div>
            {nums.map((amount, house) => (
              <div key={house} className={styles.slot}>
                <svg
                  className={styles.roof}
                  viewBox="0 0 56 22"
                  preserveAspectRatio="none"
                  data-state={houseState(house)}
                >
                  <polygon points="2,21 28,2 54,21" />
                </svg>
                <Cell
                  value={amount}
                  state={houseState(house)}
                  badge={robbedSet.has(house) && phase === "done" ? "✓" : undefined}
                />
                <span className={styles.houseLabel}>#{house + 1}</span>
              </div>
            ))}
          </div>
          <span className={styles.caption}>dp[i] = most you can take from the first i houses</span>
          <div className={styles.row}>
            {dp.map((value, k) => (
              <div key={k} className={styles.slot}>
                <span className={styles.dpLabel}>{k}</span>
                <Cell value={value ?? ""} state={dpState(k)} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </Fit>
      <div className={styles.compare}>
        {deciding && skip !== null && take !== null ? (
          <>
            <Chip state={won === "skip" ? "found" : "waiting"}>
              skip: dp[{i! - 1}] = {skip}
              {won === "skip" ? " ✓" : ""}
            </Chip>
            <Chip state={won === "take" ? "found" : "waiting"}>
              take: dp[{i! - 2}] + {nums[i! - 1]} = {take}
              {won === "take" ? " ✓" : ""}
            </Chip>
          </>
        ) : (
          <span className={styles.compareIdle}>
            {phase === "done" ? `robbed: ${[...robbedSet].map((h) => `#${h + 1}`).join(", ")}` : "skip it, or take it"}
          </span>
        )}
      </div>
      <Stats
        items={[
          { label: "skip", value: deciding ? (skip ?? "—") : "—" },
          { label: "take", value: deciding ? (take ?? "—") : "—" },
          { label: "best", value: last, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
