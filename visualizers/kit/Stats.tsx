import type { ReactNode } from "react";
import styles from "./Stats.module.css";

export type StatItem = { label: string; value: ReactNode; answer?: boolean };

/** The row of stat tiles under a view; the `answer` tile is yellow with the display font. */
export function Stats({ items }: { items: readonly StatItem[] }) {
  return (
    <div className={styles.stats}>
      {items.map((item) => (
        <div key={item.label} className={styles.stat} data-answer={item.answer === true}>
          <span className={styles.label}>{item.label}</span>
          <span className={item.answer ? styles.answerValue : styles.value}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
