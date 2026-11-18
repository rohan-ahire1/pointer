import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Chip, Chips, Fit, Panel, PointerTags, Stats, ViewRoot, type PointerTag } from "../kit";
import type { Layer, RainInput, RainState } from "./types";
import styles from "./View.module.css";

type RainViewProps = { step: Step<RainState>; input: RainInput };

function layerStyle({ from, to, base, top }: Layer): CSSProperties {
  return { "--from": from, "--to": to, "--base": base, "--top": top } as CSSProperties;
}

/**
 * docs/patterns/04-stack.md: the bars, every layer of water poured so far
 * (the newest one outlined), and the falling stack of possible left walls.
 */
export function TrappingRainWaterView({ step }: RainViewProps) {
  const { height, stack, i, floor, left, layers, fresh, water, phase } = step.state;
  const waiting = new Set(stack);

  return (
    <ViewRoot>
      <Fit n={height.length}>
        <div className={styles.chart}>
          {layers.map((layer, idx) => (
            <div
              key={idx}
              className={styles.layer}
              data-fresh={idx === fresh}
              style={layerStyle(layer)}
            />
          ))}
          {height.map((value, idx) => {
            const tags: PointerTag[] = [];
            if (idx === i) tags.push({ label: "i", tone: "orange" });
            if (idx === left) tags.push({ label: "left", tone: "inverse" });
            if (idx === floor) tags.push({ label: "floor", tone: "lilac" });
            const state =
              idx === i ? "current" : idx === floor ? "popped" : waiting.has(idx) ? "waiting" : idx < i || phase === "done" ? "past" : "ahead";
            return (
              <div key={idx} className={styles.slot}>
                <div className={styles.column}>
                  <span className={styles.value}>{value}</span>
                  <div className={styles.bar} data-state={state} style={{ "--h": value } as CSSProperties} />
                </div>
                <span className={styles.index}>{idx}</span>
                <PointerTags tags={tags} rows={2} />
              </div>
            );
          })}
        </div>
      </Fit>
      <Panel title="stack · top last">
        <Chips empty="empty">
          {stack.map((bar) => (
            <Chip key={bar} state="range">
              bar {bar} · {height[bar]}
            </Chip>
          ))}
        </Chips>
      </Panel>
      <Stats
        items={[
          { label: "bar", value: i >= 0 ? `${i} · ${height[i]}` : "—" },
          { label: "on stack", value: stack.length },
          { label: "water", value: water, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
