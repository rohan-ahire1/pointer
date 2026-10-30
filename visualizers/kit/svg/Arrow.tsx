import { NODE_SIZE, type Point } from "./treeLayout";
import styles from "./Svg.module.css";

type ArrowProps = {
  from: Point;
  to: Point;
  tone?: "plain" | "path" | "past";
  inset?: number;
};

const HEAD = 9;
/** Sideways shift, so a → b and b → a sit side by side instead of on top of each other. */
const SHIFT = 5;

/** A straight arrow between two nodes, for graphs where direction matters. */
export function Arrow({ from, to, tone = "plain", inset = NODE_SIZE / 2 + 3 }: ArrowProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const sideX = -uy * SHIFT;
  const sideY = ux * SHIFT;
  const x1 = from.x + ux * inset + sideX;
  const y1 = from.y + uy * inset + sideY;
  const x2 = to.x - ux * inset + sideX;
  const y2 = to.y - uy * inset + sideY;
  const baseX = x2 - ux * HEAD;
  const baseY = y2 - uy * HEAD;
  const n = (value: number) => Math.round(value * 100) / 100;
  return (
    <g className={styles.arrow} data-tone={tone}>
      <line x1={n(x1)} y1={n(y1)} x2={n(baseX)} y2={n(baseY)} />
      <polygon
        points={`${n(x2)},${n(y2)} ${n(baseX - uy * 5)},${n(baseY + ux * 5)} ${n(baseX + uy * 5)},${n(baseY - ux * 5)}`}
      />
    </g>
  );
}
