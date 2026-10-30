import type { Step } from "../types";
import { Arrow, NODE_SIZE, Node, Stats, Svg, ViewRoot, type CellState, type Point } from "../kit";
import type { CycleInput, CycleState } from "./types";
import styles from "./View.module.css";

type CycleViewProps = { step: Step<CycleState>; input: CycleInput };

const PER_ROW = 4;
const GAP_X = 74;
const GAP_Y = 104;
const LEFT = 36;
const TOP = 58;
const END_DROP = 66;

/** Snakes the list: left to right along the top, right to left along the bottom. */
function place(index: number): Point {
  const row = Math.floor(index / PER_ROW);
  const col = row === 0 ? index : PER_ROW - 1 - (index - PER_ROW);
  return { x: LEFT + col * GAP_X, y: TOP + row * GAP_Y };
}

/** The tail's link back into the list, curved so it never runs through another node. */
function backLink(from: Point, to: Point) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const sameRow = from.y === to.y;
  const control: Point = sameRow
    ? { x: midX, y: midY + 92 }
    : { x: midX + (from.x >= to.x ? 44 : -44), y: midY };
  const inset = NODE_SIZE / 2 + 3;
  const trim = (point: Point, toward: Point): Point => {
    const length = Math.hypot(toward.x - point.x, toward.y - point.y) || 1;
    return {
      x: point.x + ((toward.x - point.x) / length) * inset,
      y: point.y + ((toward.y - point.y) / length) * inset,
    };
  };
  const start = trim(from, control);
  const end = trim(to, control);
  const length = Math.hypot(control.x - end.x, control.y - end.y) || 1;
  const ux = (end.x - control.x) / length;
  const uy = (end.y - control.y) / length;
  const baseX = end.x - ux * 9;
  const baseY = end.y - uy * 9;
  const n = (value: number) => Math.round(value * 100) / 100;
  return {
    path: `M ${n(start.x)} ${n(start.y)} Q ${n(control.x)} ${n(control.y)} ${n(baseX)} ${n(baseY)}`,
    head: `${n(end.x)},${n(end.y)} ${n(baseX - uy * 5)},${n(baseY + ux * 5)} ${n(baseX + uy * 5)},${n(baseY - ux * 5)}`,
  };
}

/** The list as nodes and arrows, with the tail's link looping back and slow and fast labelled above. */
export function LinkedListCycleView({ step }: CycleViewProps) {
  const { values, pos, slow, fast, moves, hasCycle, phase } = step.state;
  const n = values.length;
  const rows = n > PER_ROW ? 2 : 1;
  // A full bottom row leaves no room beside the tail, so the end sits under it.
  const endBelow = pos < 0 && n === PER_ROW * 2;
  const width = LEFT * 2 + (Math.min(n, PER_ROW) - 1) * GAP_X + (pos < 0 && rows === 1 ? GAP_X : 0);
  const sameRowLoop = pos >= 0 && place(n - 1).y === place(pos).y;
  const height = TOP + (rows - 1) * GAP_Y + NODE_SIZE / 2 + (sameRowLoop ? 58 : 14) + (endBelow ? END_DROP : 0);

  const tail = place(n - 1);
  const link = pos >= 0 ? backLink(tail, place(pos)) : null;
  const endPoint: Point = endBelow
    ? { x: tail.x, y: tail.y + END_DROP }
    : { x: tail.x + (rows === 1 ? GAP_X : -GAP_X), y: tail.y };

  const stateOf = (index: number): CellState => {
    if (phase === "meet" || (phase === "done" && hasCycle)) return index === slow ? "found" : "waiting";
    if (index === fast || index === slow) return "current";
    return "waiting";
  };

  const label = (index: number) =>
    [index === slow ? "slow" : "", index === fast ? "fast" : ""].filter(Boolean).join(" · ");

  return (
    <ViewRoot>
      <div className={styles.wrap}>
        <Svg width={width} height={height}>
          {values.slice(0, -1).map((_, index) => (
            <Arrow key={index} from={place(index)} to={place(index + 1)} />
          ))}
          {link && (
            <g className={styles.loop} data-met={hasCycle === true}>
              <path d={link.path} />
              <polygon points={link.head} />
            </g>
          )}
          {!link && (
            <>
              <Arrow key="to-end" from={tail} to={endPoint} inset={NODE_SIZE / 2 + 3} />
              <Node key="end" at={endPoint} label="∅" state={fast === null ? "current" : "past"} size={34} />
            </>
          )}
          {values.map((value, index) => (
            <Node key={index} at={place(index)} label={value} state={stateOf(index)} />
          ))}
          {values.map((_, index) => {
            const text = label(index);
            if (!text) return null;
            const point = place(index);
            return (
              <text key={`tag-${index}`} className={styles.tag} x={point.x} y={point.y - NODE_SIZE / 2 - 12}>
                {text}
              </text>
            );
          })}
        </Svg>
      </div>
      <Stats
        items={[
          { label: "moves", value: moves },
          { label: "tail links to", value: pos >= 0 ? `index ${pos}` : "nothing" },
          { label: "cycle?", value: hasCycle === null ? "—" : hasCycle ? "yes" : "no", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
