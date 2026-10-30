import type { Step } from "../types";
import { Chip, Chips, Panel, Split, Stats, Strip, ViewRoot, type StripItem } from "../kit";
import type { TemperaturesInput, TemperaturesState } from "./types";
import styles from "./View.module.css";

type TemperaturesViewProps = { step: Step<TemperaturesState>; input: TemperaturesInput };

/** The days with `i` walking them, the answers filling in below, and the stack of days still waiting. */
export function DailyTemperaturesView({ step }: TemperaturesViewProps) {
  const { temps, out, stack, i, popped, phase } = step.state;
  const waiting = new Set(stack);

  const dayItems: StripItem[] = temps.map((value, idx) => ({
    key: idx,
    value,
    above: idx,
    state: idx === i ? "current" : idx === popped ? "found" : waiting.has(idx) ? "range" : idx < i ? "past" : "waiting",
    tags: idx === i ? [{ label: "i", tone: "orange" }] : [],
  }));

  const answered = (idx: number) => out[idx] > 0;
  const outItems: StripItem[] = out.map((value, idx) => ({
    key: idx,
    value: answered(idx) || phase === "done" ? value : "",
    state: idx === popped ? "current" : answered(idx) ? "found" : "waiting",
  }));

  return (
    <ViewRoot>
      <Split>
        <Strip items={dayItems} />
        <div className={styles.stackWrap}>
          <Panel title="stack · top last">
            <Chips empty="empty">
              {stack.map((day) => (
                <Chip key={day} state="range">
                  {temps[day]}° · day {day}
                </Chip>
              ))}
            </Chips>
          </Panel>
        </div>
      </Split>
      <Panel title="days to wait">
        <Strip items={outItems} tagRows={0} />
      </Panel>
      <Stats
        items={[
          { label: "today", value: i >= 0 ? `${temps[i]}°` : "—" },
          { label: "waiting", value: stack.length },
          { label: "answered", value: out.filter((value) => value > 0).length, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
