import type { Step } from "../types";
import { Cell, Fit, Stats, Strip, ViewRoot, type CellState, type StripItem } from "../kit";
import { WIDTH, bitsOf } from "./trace";
import type { CountingBitsInput, CountingBitsState } from "./types";
import styles from "./View.module.css";

type CountingBitsViewProps = { step: Step<CountingBitsState>; input: CountingBitsInput };

type BitRowProps = { label: string; value: number | null; stateOf: (index: number) => CellState };

/** One number as a row of bits. A row not in use yet shows dots. */
function BitRow({ label, value, stateOf }: BitRowProps) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>
        {label}
        {value !== null && ` = ${value}`}
      </span>
      <Fit n={WIDTH}>
        <div className={styles.bits}>
          {value === null
            ? Array.from({ length: WIDTH }, (_, index) => <Cell key={index} value="·" state="past" size="sm" />)
            : bitsOf(value).map((bit, index) => <Cell key={index} value={bit} state={stateOf(index)} size="sm" />)}
        </div>
      </Fit>
    </div>
  );
}

/** ans as a strip, i and the reused cell tagged, with i and i >> 1 in binary underneath so the dropped bit is easy to see. */
export function CountingBitsView({ step }: CountingBitsViewProps) {
  const { ans, i, half, last, phase } = step.state;

  const items: StripItem[] = ans.map((value, index) => {
    const tags = [];
    if (index === i) tags.push({ label: "i", tone: "orange" as const });
    if (index === half && i !== null) tags.push({ label: "reuse", tone: "inverse" as const });
    let state: CellState = value === null ? "waiting" : "done";
    if (index === half && i !== null) state = "found";
    if (index === i) state = "current";
    return { key: index, value: value ?? "·", state, above: index, tags };
  });

  const iBits = i === null ? null : i;
  const halfBits = i === null ? null : (half ?? 0);

  return (
    <ViewRoot>
      <Strip items={items} tagRows={2} />
      <div className={styles.rows}>
        <BitRow label="i" value={iBits} stateOf={(index) => (index === WIDTH - 1 ? "current" : "done")} />
        <BitRow
          label="i >> 1"
          value={halfBits}
          stateOf={(index) => (bitsOf(halfBits ?? 0)[index] === 1 ? "found" : "waiting")}
        />
      </div>
      <Stats
        items={[
          { label: "i", value: i ?? "–" },
          { label: "ans[i >> 1]", value: half === null ? "–" : (ans[half] ?? "–") },
          { label: "i & 1", value: last ?? "–" },
          { label: "ans[i]", value: i !== null && phase === "fill" ? (ans[i] ?? "–") : "–", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
