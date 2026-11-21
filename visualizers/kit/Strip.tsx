"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Cell, type CellState } from "./Cell";
import { Fit } from "./ViewRoot";
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

/** Below this a cell's text stops being readable, so the strip wraps instead of shrinking further. */
export const MIN_READABLE_CELL = 28;

/** How many cells to put in each row so every cell is at least MIN_READABLE_CELL wide, with rows as even as possible. */
export function cellsPerRow(count: number, width: number, gap: number): number {
  if (count <= 0 || width <= 0) return Math.max(1, count);
  const fit = Math.max(1, Math.floor((width + gap) / (MIN_READABLE_CELL + gap)));
  const rows = Math.ceil(count / fit);
  return Math.ceil(count / rows);
}

/** Cells per row for the strip in `ref`, kept up to date as it resizes. Before the first measure, one row. */
function useCellsPerRow(ref: RefObject<HTMLDivElement | null>, count: number): number {
  const [perRow, setPerRow] = useState(count);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const gap = parseFloat(getComputedStyle(el).getPropertyValue("--cell-gap")) || 8;
      setPerRow(cellsPerRow(count, el.clientWidth, gap));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, count]);
  return Math.min(Math.max(1, perRow), Math.max(1, count));
}

/**
 * A row of cells with optional labels above, pointer tags below and a
 * capsule behind a range — most array views are just this. When the cells
 * would get too small to read (long inputs on phones), it wraps onto more
 * rows of equal-size cells, and the capsule is drawn on each row it covers.
 */
export function Strip({ items, capsule = null, tagRows = 1 }: StripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const perRow = useCellsPerRow(ref, items.length);
  const hasAbove = items.some((item) => item.above !== undefined);

  const rows: { offset: number; items: readonly StripItem[] }[] = [];
  for (let offset = 0; offset < items.length; offset += perRow) rows.push({ offset, items: items.slice(offset, offset + perRow) });
  if (rows.length === 0) rows.push({ offset: 0, items: [] });

  const capsuleStyleFor = (offset: number, length: number): CSSProperties | null => {
    if (!capsule || capsule.end < capsule.start) return null;
    const start = Math.max(capsule.start, offset);
    const end = Math.min(capsule.end, offset + length - 1);
    if (end < start) return null;
    return {
      "--start": start - offset,
      "--span": end - start + 1,
      "--above-h": hasAbove ? "24px" : "0px",
    } as CSSProperties;
  };

  return (
    <div ref={ref} className={styles.rows} data-strip-rows={rows.length}>
      {rows.map((row) => {
        const capsuleStyle = capsuleStyleFor(row.offset, row.items.length);
        return (
          <Fit key={row.offset} n={perRow}>
            <div className={styles.strip}>
              {capsuleStyle && <div className={styles.capsule} style={capsuleStyle} />}
              {row.items.map((item) => (
                <div key={item.key} className={styles.slot}>
                  {hasAbove && <span className={styles.above}>{item.above}</span>}
                  <Cell value={item.value} state={item.state} badge={item.badge} />
                  <PointerTags tags={item.tags ?? []} rows={tagRows} />
                </div>
              ))}
            </div>
          </Fit>
        );
      })}
    </div>
  );
}
