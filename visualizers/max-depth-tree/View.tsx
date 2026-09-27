import type { Step } from "../types";
import { Chip, Edge, heapPosition, LEVEL_GAP, NODE_SIZE, Node, Panel, Split, Stats, Svg, ViewRoot } from "../kit";
import type { CellState } from "../kit";
import type { MaxDepthInput, MaxDepthState } from "./types";
import styles from "./View.module.css";

type MaxDepthViewProps = { step: Step<MaxDepthState>; input: MaxDepthInput };

/** Horizontal room per bottom-level node, in viewBox units. */
const SLOT = 60;

/**
 * docs/patterns/07-trees.md: the tree, with the call stack lit up as a path
 * from the root; each node shows its depth in a badge once it answers, so
 * the answers visibly bubble up from the leaves.
 */
export function MaxDepthTreeView({ step }: MaxDepthViewProps) {
  const { nodes, stack, answers, current, probe, phase, answer } = step.state;
  const levels = Math.max(1, ...nodes.map((node) => node.depth));
  const width = Math.max(3, 2 ** (levels - 1)) * SLOT;
  const height = levels * LEVEL_GAP + 8;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const onStack = new Set(stack);
  const at = (pos: number) => heapPosition(pos, width);

  const stateOf = (id: number): CellState => {
    if (id === current && phase !== "done") return "current";
    if (answers[id] !== undefined) return "done";
    if (onStack.has(id)) return "range";
    return "waiting";
  };

  const probeParent = probe ? byId.get(probe.parent) : undefined;
  const probePos = probeParent ? probeParent.pos * 2 + (probe?.side === "right" ? 1 : 0) : null;

  return (
    <ViewRoot>
      <Split>
        <div className={styles.treeWrap}>
          <Svg width={width} height={height}>
            {nodes.flatMap((node) =>
              [node.left, node.right]
                .filter((child): child is number => child !== null)
                .map((child) => {
                  const childNode = byId.get(child)!;
                  return (
                    <Edge
                      key={`${node.id}-${child}`}
                      from={at(node.pos)}
                      to={at(childNode.pos)}
                      tone={onStack.has(child) && onStack.has(node.id) ? "path" : "plain"}
                    />
                  );
                }),
            )}
            {probeParent && probePos !== null && (
              <>
                <Edge key="probe-edge" from={at(probeParent.pos)} to={at(probePos)} tone="past" inset={18} />
                <Node key={`probe-${probePos}`} at={at(probePos)} label="∅" state="past" size={30} />
              </>
            )}
            {nodes.map((node) => (
              <Node
                key={node.id}
                at={at(node.pos)}
                label={node.value}
                state={stateOf(node.id)}
                size={NODE_SIZE}
                badge={answers[node.id] !== undefined ? String(answers[node.id]) : undefined}
              />
            ))}
          </Svg>
        </div>
        <div className={styles.stackWrap}>
          <Panel title="call stack">
            <div className={styles.frames}>
              {stack.length === 0 && <span className={styles.empty}>empty</span>}
              {[...stack].reverse().map((id, idx) => (
                <Chip key={id} state={idx === 0 && phase !== "done" ? "current" : "waiting"}>
                  maxDepth({byId.get(id)?.value}){answers[id] !== undefined ? ` → ${answers[id]}` : ""}
                </Chip>
              ))}
            </div>
          </Panel>
        </div>
      </Split>
      <Stats
        items={[
          { label: "node", value: current !== null && phase !== "done" ? (byId.get(current)?.value ?? "—") : "—" },
          { label: "stack depth", value: stack.length },
          { label: "max depth", value: answer ?? "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
