import type { Step } from "../types";
import { Chip, Chips, Edge, heapPosition, LEVEL_GAP, list, NODE_SIZE, Node, Panel, Split, Stats, Svg, ViewRoot } from "../kit";
import type { CellState } from "../kit";
import type { LevelOrderInput, LevelOrderState } from "./types";
import styles from "./View.module.css";

type LevelOrderViewProps = { step: Step<LevelOrderState>; input: LevelOrderInput };

/** Horizontal room per bottom-level node, in viewBox units. */
const SLOT = 60;

/** The tree filling in level by level, with the queue and the finished levels beside it. */
export function LevelOrderView({ step }: LevelOrderViewProps) {
  const { nodes, queue, next, level, out, current, added, phase } = step.state;
  const levels = Math.max(1, ...nodes.map((node) => node.depth));
  const width = Math.max(3, 2 ** (levels - 1)) * SLOT;
  const height = levels * LEVEL_GAP + 8;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const at = (pos: number) => heapPosition(pos, width);
  const value = (id: number) => byId.get(id)?.value ?? "";

  const visitedDepth = out.length;
  const inQueue = new Set(queue);
  const inNext = new Set(next);
  const stateOf = (id: number): CellState => {
    const node = byId.get(id)!;
    if (id === current) return "current";
    if (id === added) return "range";
    if (node.depth <= visitedDepth) return "done";
    if (inQueue.has(id) || inNext.has(id)) return "range";
    return "waiting";
  };

  return (
    <ViewRoot>
      <Split>
        <div className={styles.treeWrap}>
          <Svg width={width} height={height}>
            {nodes.flatMap((node) =>
              [node.left, node.right]
                .filter((child): child is number => child !== null)
                .map((child) => (
                  <Edge key={`${node.id}-${child}`} from={at(node.pos)} to={at(byId.get(child)!.pos)} tone={child === added ? "path" : "plain"} />
                )),
            )}
            {nodes.map((node) => (
              <Node key={node.id} at={at(node.pos)} label={node.value} state={stateOf(node.id)} size={NODE_SIZE} />
            ))}
          </Svg>
        </div>
        <div className={styles.side}>
          <Panel title="queue">
            <Chips empty="empty">
              {queue.map((id) => (
                <Chip key={id} state="range">
                  {value(id)}
                </Chip>
              ))}
            </Chips>
          </Panel>
          <Panel title="next level">
            <Chips empty="empty">
              {next.map((id) => (
                <Chip key={id}>{value(id)}</Chip>
              ))}
            </Chips>
          </Panel>
        </div>
      </Split>
      <Panel title="levels">
        <Chips empty="none yet">
          {[
            ...out.map((row, index) => (
              <Chip key={index} state="found">
                {list(row)}
              </Chip>
            )),
            ...(phase === "visit" || phase === "child"
              ? [
                  <Chip key="now" state="current">
                    {list(level)}
                  </Chip>,
                ]
              : []),
          ]}
        </Chips>
      </Panel>
      <Stats
        items={[
          { label: "node", value: current !== null ? value(current) : "—" },
          { label: "in queue", value: queue.length },
          { label: "levels", value: out.length, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
