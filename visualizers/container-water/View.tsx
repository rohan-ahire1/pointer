import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Fit, PointerTags, Stats, ViewRoot, type PointerTag } from "../kit";
import type { ContainerInput, ContainerState } from "./types";
import styles from "./View.module.css";

type ContainerViewProps = { step: Step<ContainerState>; input: ContainerInput };

/** Horizontal geometry for a water rectangle between two walls, in CSS vars the stylesheet turns into px. */
function span(a: number, b: number, level: number): CSSProperties {
  return { "--from": a, "--to": b, "--level": level } as CSSProperties;
}

/**
 * docs/patterns/02-two-pointers.md: walls as bars, the water between the two
 * pointers as a rectangle filled to the shorter wall, and the best container
 * so far kept as a dashed outline to compare against.
 */
export function ContainerWaterView({ step }: ContainerViewProps) {
  const { height, left, right, phase, h, area, best, bestPair, newBest, moving } = step.state;
  const showWater = h !== null && phase !== "setup" && phase !== "done";
  const bestLevel = bestPair ? Math.min(height[bestPair[0]], height[bestPair[1]]) : 0;

  return (
    <ViewRoot>
      <Fit n={height.length}>
        <div className={styles.chart}>
          {bestPair && bestLevel > 0 && (
            <div className={styles.best} style={span(bestPair[0], bestPair[1], bestLevel)}>
              <span className={styles.bestLabel}>best {best}</span>
            </div>
          )}
          {showWater && h > 0 && (
            <div className={styles.water} style={span(left, right, h)}>
              <span className={styles.waterLabel}>
                {newBest ? "★ " : ""}area {area}
              </span>
            </div>
          )}
          {height.map((value, idx) => {
            const out = idx < left || idx > right;
            const lifted =
              phase === "move" && ((moving === "left" && idx === left) || (moving === "right" && idx === right));
            const tags: PointerTag[] = [];
            if (idx === left) tags.push({ label: "L", tone: "inverse" });
            if (idx === right) tags.push({ label: "R", tone: "orange" });
            return (
              <div key={idx} className={styles.slot}>
                <div className={styles.column}>
                  <span className={styles.value} data-out={out}>
                    {value}
                  </span>
                  <div
                    className={styles.bar}
                    data-state={lifted ? "current" : out ? "past" : "waiting"}
                    style={{ "--h": value } as CSSProperties}
                  />
                </div>
                <span className={styles.index}>{idx}</span>
                <PointerTags tags={tags} rows={2} />
              </div>
            );
          })}
        </div>
      </Fit>
      <Stats
        items={[
          { label: "width", value: showWater ? right - left : "—" },
          { label: "water height", value: showWater ? h : "—" },
          { label: "area", value: showWater ? area : "—" },
          { label: "best", value: best, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
