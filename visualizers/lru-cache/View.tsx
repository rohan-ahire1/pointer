import { Fragment } from "react";
import type { Step } from "../types";
import { Chip, Chips, Panel, Stats, ViewRoot } from "../kit";
import type { LruCall, LruInput, LruState } from "./types";
import styles from "./View.module.css";

type LruViewProps = { step: Step<LruState>; input: LruInput };

const callText = (c: LruCall) => (c.op === "get" ? `get ${c.key}` : `put ${c.key} ${c.value}`);

/**
 * docs/patterns/06b-design.md: the calls, the linked list from oldest to newest
 * between its two sentinels, and the map that jumps straight to each node.
 */
export function LruCacheView({ step }: LruViewProps) {
  const { capacity, calls, call, list, key, evicted, results, phase } = step.state;
  const last = call >= 0 ? results[call] : null;

  return (
    <ViewRoot>
      <Panel title="calls">
        <Chips>
          {calls.map((c, idx) => (
            <Chip key={idx} state={idx === call ? "current" : idx < call || phase === "done" ? "done" : "waiting"}>
              {callText(c)}
              {results[idx] !== null ? ` → ${results[idx]}` : ""}
            </Chip>
          ))}
        </Chips>
      </Panel>
      <div className={styles.listWrap} role="img" aria-label={`List from oldest to newest: ${list.map((n) => n.key).join(", ") || "empty"}`}>
        <div className={styles.ends}>
          <span>oldest</span>
          <span>newest</span>
        </div>
        <div className={styles.list}>
          {evicted !== null && (
            <span className={styles.node} data-state="evicted">
              <span className={styles.key}>{evicted}</span>
              <span className={styles.value}>evicted</span>
            </span>
          )}
          <span className={styles.sentinel}>head</span>
          {list.map((node) => (
            <Fragment key={node.key}>
              <span className={styles.link} aria-hidden="true">
                ⇄
              </span>
              <span className={styles.node} data-state={node.key === key && phase !== "miss" ? "current" : "waiting"}>
                <span className={styles.key}>{node.key}</span>
                <span className={styles.value}>{node.value}</span>
              </span>
            </Fragment>
          ))}
          <span className={styles.link} aria-hidden="true">
            ⇄
          </span>
          <span className={styles.sentinel}>tail</span>
        </div>
      </div>
      <Panel title="map · key → node">
        <Chips empty="empty">
          {[...list]
            .sort((a, b) => a.key - b.key)
            .map((node) => (
              <Chip key={node.key} state={node.key === key && phase !== "miss" ? "current" : "range"}>
                {node.key} → node
              </Chip>
            ))}
        </Chips>
      </Panel>
      <Stats
        items={[
          { label: "call", value: call >= 0 ? callText(calls[call]) : "—" },
          { label: "size", value: `${list.length} of ${capacity}` },
          { label: "returned", value: last ?? "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
