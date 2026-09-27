import type { Step } from "../types";
import { Panel, Split, Stats, Strip, ViewRoot, type StripItem } from "../kit";
import type { ParensInput, ParensState } from "./types";
import styles from "./View.module.css";

type ParensViewProps = { step: Step<ParensState>; input: ParensInput };

/** Plates shown before collapsing the rest into a "+n below" chip. */
const VISIBLE_PLATES = 5;

const OPENER: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

/**
 * docs/patterns/04-stack.md: the brackets with `i` reading them, and a stack
 * of plates. Openers drop onto the stack; a matching closer lifts the top
 * plate off, and both brackets settle as a pair.
 */
export function ValidParenthesesView({ step }: ParensViewProps) {
  const { s, i, stack, matched, phase, failedAt, verdict } = step.state;
  const settled = new Set(matched);

  const items: StripItem[] = s.split("").map((ch, idx) => ({
    key: idx,
    value: ch,
    state:
      idx === failedAt ? "current" : settled.has(idx) ? "found" : idx === i ? "current" : idx < i ? "range" : "waiting",
    badge: idx === failedAt ? "✕" : undefined,
    tags: idx === i ? [{ label: "i", tone: "orange" }] : [],
  }));

  // Top of the stack first, so the column reads top-down like a real pile.
  const plates = [...stack].reverse();
  const shown = plates.slice(0, VISIBLE_PLATES);
  const hidden = plates.length - shown.length;

  return (
    <ViewRoot>
      <Split>
        <Strip items={items} />
        <div className={styles.stackWrap}>
          <Panel title="stack">
            <div className={styles.pile}>
              {/* The plate a match just took off: lifts away and fades for this step only. */}
              {phase === "match" && (
                <div key={`lifted-${i}`} className={`${styles.plate} ${styles.lifted}`}>
                  <span className={styles.plateCh}>{OPENER[s[i]]}</span>
                </div>
              )}
              {shown.length === 0 && <div className={styles.empty}>empty</div>}
              {shown.map((plate, idx) => (
                <div key={plate.from} className={styles.plate} data-top={idx === 0}>
                  <span className={styles.plateCh}>{plate.ch}</span>
                  <span className={styles.plateFrom}>from {plate.from}</span>
                  {idx === 0 && <span className={styles.top}>top</span>}
                </div>
              ))}
              {hidden > 0 && <div className={styles.more}>+{hidden} below</div>}
            </div>
          </Panel>
        </div>
      </Split>
      <Stats
        items={[
          { label: "reading", value: i >= 0 && i < s.length && phase !== "done" ? s[i] : "—" },
          { label: "stack depth", value: stack.length },
          { label: "valid?", value: verdict === null ? "…" : verdict ? "yes ✓" : "no ✕", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
