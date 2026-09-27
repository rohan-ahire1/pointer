import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Cell, Fit, PointerTags, Stats, ViewRoot, type CellState, type PointerTag } from "../kit";
import type { JumpInput, JumpState } from "./types";
import styles from "./View.module.css";

type JumpViewProps = { step: Step<JumpState>; input: JumpInput };

/**
 * docs/patterns/14-greedy.md: stepping stones with the reachable zone as a
 * capsule that only ever grows. An arc shows the current stone's jump —
 * solid when it pushes the reach further, dashed when it doesn't.
 */
export function JumpGameView({ step }: JumpViewProps) {
  const { nums, i, reach, prevReach, phase, stuckAt, verdict } = step.state;
  const last = nums.length - 1;
  const reachEnd = Math.min(reach, last);
  const jumping = (phase === "extend" || phase === "noGain") && i !== null;
  const landing = jumping ? i! + nums[i!] : 0;

  const stoneState = (idx: number): CellState => {
    if (idx === stuckAt) return "past";
    if (idx === i && phase !== "done" && phase !== "stuck") return "current";
    if (phase === "done" && verdict && idx === last) return "found";
    return "waiting";
  };

  const tagsFor = (idx: number): PointerTag[] => {
    const tags: PointerTag[] = [];
    if (idx === i && phase !== "done") tags.push({ label: "i", tone: "orange" });
    if (idx === reachEnd) tags.push({ label: "reach", tone: "inverse" });
    return tags;
  };

  const arcStyle = {
    "--from": i ?? 0,
    "--to": Math.min(landing, last),
  } as CSSProperties;

  return (
    <ViewRoot>
      <Fit n={nums.length}>
        <div className={styles.lane}>
          <div className={styles.arcRow}>
            {jumping && nums[i!] > 0 && (
              <div key={`${i}-${phase}`} className={styles.arc} style={arcStyle} data-gain={reach > prevReach}>
                <span className={styles.arcLabel}>
                  +{nums[i!]}
                  {landing > last ? " (past the end)" : ""}
                </span>
              </div>
            )}
          </div>
          <div className={styles.row}>
            <div
              className={styles.capsule}
              style={{ "--start": 0, "--span": reachEnd + 1 } as CSSProperties}
              data-end={phase === "done" && verdict}
            />
            {nums.map((jump, idx) => (
              <div key={idx} className={styles.slot}>
                <span className={styles.index}>{idx}</span>
                <Cell value={jump} state={stoneState(idx)} badge={idx === stuckAt ? "✕" : undefined} />
                <PointerTags tags={tagsFor(idx)} rows={2} />
              </div>
            ))}
          </div>
        </div>
      </Fit>
      <Stats
        items={[
          { label: "i + nums[i]", value: jumping ? landing : "—" },
          { label: "farthest", value: reach },
          { label: "reach the end?", value: verdict === null ? "…" : verdict ? "yes ✓" : "no ✕", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
