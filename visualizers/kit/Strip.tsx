import type { CSSProperties, ReactNode } from "react";
import { Cell, type CellState } from "./Cell";
import { PointerTags, type PointerTag } from "./PointerTags";
import styles from "./Strip.module.css";

export type StripItem = {
  /** Stable identity (usually the index) — used as the React key. */
  key: string | number;
  value: ReactNode;
  state?: CellState;
  badge?: ReactNode;
  tags?: readonly PointerTag[];
  /** Small label above the cell, e.g. its index. */
  above?: ReactNode;
};

type StripProps = {
  items: readonly StripItem[];
  /** Inclusive range to wrap in the yellow capsule, or null for none. */
  capsule?: { start: number; end: number } | null;
  /** Tag rows to reserve under every cell. */
  tagRows?: number;
};

/**
 * A row of cells with optional labels above, pointer tags below and a
 * capsule behind a range — most array views are just this.
 */
export function Strip({ items, capsule = null, tagRows = 1 }: StripProps) {
  const hasAbove = items.some((item) => item.above !== undefined);
  const capsuleStyle =
    capsule && capsule.end >= capsule.start
      ? ({
          "--start": capsule.start,
          "--span": capsule.end - capsule.start + 1,
          "--above-h": hasAbove ? "24px" : "0px",
        } as CSSProperties)
      : null;

  return (
    <div className={styles.strip}>
      {capsuleStyle && <div className={styles.capsule} style={capsuleStyle} />}
      {items.map((item) => (
        <div key={item.key} className={styles.slot}>
          {hasAbove && <span className={styles.above}>{item.above}</span>}
          <Cell value={item.value} state={item.state} badge={item.badge} />
          <PointerTags tags={item.tags ?? []} rows={tagRows} />
        </div>
      ))}
    </div>
  );
}
