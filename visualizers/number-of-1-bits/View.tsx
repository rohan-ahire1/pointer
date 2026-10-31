import type { Step } from "../types";
import { Cell, Fit, Stats, ViewRoot, type CellState } from "../kit";
import { WIDTH, bitsOf } from "./trace";
import type { BitsInput, BitsState } from "./types";
import styles from "./View.module.css";

type BitsViewProps = { step: Step<BitsState>; input: BitsInput };

type BitRowProps = { label: string; value: number | null; lowest: number | null };

/** One number as a row of bits. The lowest 1 stands out, and a row not worked out yet shows dashes. */
function BitRow({ label, value, lowest }: BitRowProps) {
  const stateOf = (index: number, bit: number): CellState => {
    if (lowest === WIDTH - 1 - index) return "current";
    return bit === 1 ? "done" : "waiting";
  };
  return (
    <div className={styles.row}>
      <span className={styles.label}>
        {label}
        {value !== null && ` = ${value}`}
      </span>
      <Fit n={WIDTH}>
        {value === null
          ? Array.from({ length: WIDTH }, (_, index) => <Cell key={index} value="·" state="past" size="sm" />)
          : bitsOf(value).map((bit, index) => <Cell key={index} value={bit} state={stateOf(index, bit)} size="sm" />)}
      </Fit>
    </div>
  );
}

/** n, n − 1 and their AND, stacked so the bits line up. */
export function NumberOfOneBitsView({ step }: BitsViewProps) {
  const { n, below, result, lowest, count } = step.state;
  return (
    <ViewRoot>
      <div className={styles.rows}>
        <BitRow label="n" value={n} lowest={lowest} />
        <BitRow label="n − 1" value={below} lowest={lowest} />
        <BitRow label="n & (n − 1)" value={result} lowest={null} />
      </div>
      <Stats
        items={[
          { label: "n", value: n },
          { label: "bits left", value: bitsOf(n).filter((bit) => bit === 1).length },
          { label: "count", value: count, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
