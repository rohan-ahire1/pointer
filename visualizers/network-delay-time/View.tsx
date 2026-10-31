import type { Step } from "../types";
import { Arrow, Chip, Chips, EdgeLabel, Node, Panel, Split, Stats, Svg, ViewRoot, type CellState, type Point } from "../kit";
import type { NetworkInput, NetworkState } from "./types";
import styles from "./View.module.css";

type NetworkViewProps = { step: Step<NetworkState>; input: NetworkInput };

const SIZE = 300;
const RADIUS = 110;
/** How far along a road its cost sits, past the middle so two opposite roads don't share a spot. */
const LABEL_AT = 0.58;

/** Nodes sit on a circle, so a road between two of them never crosses a third. */
function place(index: number, n: number): Point {
  const angle = (index / n) * 2 * Math.PI - Math.PI / 2;
  const round = (value: number) => Math.round(value * 100) / 100;
  return { x: round(SIZE / 2 + RADIUS * Math.cos(angle)), y: round(SIZE / 2 + RADIUS * Math.sin(angle)) };
}

function along(from: Point, to: Point): Point {
  return { x: from.x + (to.x - from.x) * LABEL_AT, y: from.y + (to.y - from.y) * LABEL_AT };
}

/** The roads with their costs, each node's best time so far, and the heap beside them. */
export function NetworkDelayView({ step }: NetworkViewProps) {
  const { n, roads, best, settled, heap, current, trying, delay } = step.state;

  const stateOf = (node: number): CellState => {
    if (node === current) return "current";
    if (settled.includes(node)) return "done";
    if (best[node] !== null) return "range";
    return "waiting";
  };

  return (
    <ViewRoot>
      <Split>
        <div className={styles.graphWrap}>
          <Svg width={SIZE} height={SIZE}>
            {roads.map(([from, to], index) => (
              <Arrow key={index} from={place(from, n)} to={place(to, n)} tone={index === trying ? "path" : settled.includes(from) ? "past" : "plain"} />
            ))}
            {roads.map(([from, to, cost], index) => {
              const at = along(place(from, n), place(to, n));
              return <EdgeLabel key={index} from={at} to={at} text={String(cost)} />;
            })}
            {Array.from({ length: n }, (_, node) => (
              <Node key={node} at={place(node, n)} label={node} state={stateOf(node)} badge={best[node] === null ? "∞" : String(best[node])} />
            ))}
          </Svg>
        </div>
        <div className={styles.side}>
          <Panel title="heap · smallest first">
            <Chips empty="empty">
              {heap.map(([time, node], index) => (
                <Chip key={`${time}-${node}-${index}`} state="range">
                  {time} → {node}
                </Chip>
              ))}
            </Chips>
          </Panel>
          <Panel title="final, in order">
            <Chips empty="none yet">
              {settled.map((node) => (
                <Chip key={node} state="found">
                  {node}
                </Chip>
              ))}
            </Chips>
          </Panel>
        </div>
      </Split>
      <Stats
        items={[
          { label: "final", value: `${settled.length} of ${n}` },
          { label: "heap", value: heap.length },
          { label: "delay", value: delay === null ? "—" : delay, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
