import type { ReactNode } from "react";
import type { CellState } from "../Cell";
import { NODE_SIZE, type Point } from "./treeLayout";
import styles from "./Svg.module.css";

/** Scales to its container's width; everything inside is in viewBox units. */
export function Svg({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  return (
    <svg className={styles.svg} viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      {children}
    </svg>
  );
}

type NodeProps = {
  at: Point;
  label: ReactNode;
  state?: CellState;
  size?: number;
  /** A second ring: the non-colour signal for "a word ends here" and similar. */
  ring?: boolean;
  /** Corner badge text (a depth, ★, ✓, ✂). */
  badge?: string;
  fontSize?: number;
};

/** A circle node with the same states as a Cell. Moves by transform, so relayouts glide. */
export function Node({ at, label, state = "waiting", size = NODE_SIZE, ring = false, badge, fontSize }: NodeProps) {
  const r = size / 2;
  return (
    <g className={styles.node} data-state={state} style={{ transform: `translate(${at.x}px, ${at.y}px)` }}>
      <g className={styles.enter}>
        <g className={styles.lift}>
          <circle className={styles.shape} r={r} />
          {ring && <circle className={styles.ring} r={r - 5} />}
          <text className={styles.label} fontSize={fontSize ?? Math.round(size * 0.4)}>
            {label}
          </text>
        </g>
        {badge !== undefined && (
          <g className={styles.badge} transform={`translate(${r * 0.78}, ${-r * 0.78})`}>
            <circle r={10} />
            <text>{badge}</text>
          </g>
        )}
      </g>
    </g>
  );
}

type EdgeProps = {
  from: Point;
  to: Point;
  tone?: "plain" | "path" | "past";
  /** Shorten both ends by this much so the line stops at the node circles. */
  inset?: number;
};

/**
 * A straight edge drawn as a unit line inside a translated/rotated/scaled
 * group, so moving endpoints animate with CSS transforms in every browser.
 */
export function Edge({ from, to, tone = "plain", inset = NODE_SIZE / 2 }: EdgeProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const usable = Math.max(0, length - inset * 2);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const ux = length === 0 ? 0 : dx / length;
  const uy = length === 0 ? 0 : dy / length;
  const start = { x: from.x + ux * inset, y: from.y + uy * inset };
  return (
    <g
      className={styles.edge}
      data-tone={tone}
      style={{ transform: `translate(${start.x}px, ${start.y}px) rotate(${angle}deg) scaleX(${usable})` }}
    >
      <line x1={0} y1={0} x2={1} y2={0} vectorEffect="non-scaling-stroke" />
    </g>
  );
}

/** A small label sitting on an edge's midpoint (e.g. the number picked in a decision tree). */
export function EdgeLabel({ from, to, text }: { from: Point; to: Point; text: string }) {
  const x = (from.x + to.x) / 2;
  const y = (from.y + to.y) / 2;
  const w = 8 + text.length * 8;
  return (
    <g className={styles.edgeLabel} style={{ transform: `translate(${x}px, ${y}px)` }}>
      <rect x={-w / 2} y={-9} width={w} height={18} rx={6} />
      <text>{text}</text>
    </g>
  );
}
