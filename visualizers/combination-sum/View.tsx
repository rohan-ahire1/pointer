import type { CSSProperties } from "react";
import type { Step } from "../types";
import { Chip, Chips, Edge, EdgeLabel, Node, Stats, Svg, tidyLayout, ViewRoot } from "../kit";
import type { CellState } from "../kit";
import type { CombinationInput, CombinationNode, CombinationState } from "./types";
import styles from "./View.module.css";

type CombinationViewProps = { step: Step<CombinationState>; input: CombinationInput };

const SLOT = 40;
const NODE = 32;
const LEVEL = 62;
const TOP = NODE / 2 + 6;

/**
 * The shape of the finished decision tree, from the input alone (the same
 * sorted search the solution runs, counting a cut branch as a leaf), so the
 * picture keeps one size for the whole run.
 */
function finalShape({ candidates, target }: CombinationInput) {
  const sorted = [...candidates].sort((a, b) => a - b);
  let leaves = 0;
  let depth = 0;
  const dfs = (start: number, remaining: number, level: number) => {
    depth = Math.max(depth, level);
    if (remaining === 0) {
      leaves += 1;
      return;
    }
    let children = 0;
    for (let i = start; i < sorted.length; i++) {
      children += 1;
      if (sorted[i] > remaining) {
        depth = Math.max(depth, level + 1);
        leaves += 1;
        break;
      }
      dfs(i, remaining - sorted[i], level + 1);
    }
    if (children === 0) leaves += 1;
  };
  dfs(0, target, 0);
  return { leaves, levels: depth + 1 };
}

function stateOf(node: CombinationNode, current: number, done: boolean): CellState {
  if (node.id === current && !done) return node.status === "cut" ? "past" : "current";
  if (node.status === "found") return "found";
  if (node.status === "cut") return "past";
  if (node.status === "path" && !done) return "range";
  return "waiting";
}

/**
 * docs/patterns/10-backtracking.md: the decision tree grows as numbers are
 * tried — each edge is the number picked, each node what's still needed.
 * Cut branches are dashed with ✂, finished combinations are mint with ✓.
 * The sum bar underneath shows the current path filling the target.
 */
export function CombinationSumView({ step, input }: CombinationViewProps) {
  const { target, path, remaining, tree, current, phase, results } = step.state;
  const done = phase === "done";
  const shape = finalShape(input);
  const { positions, slots } = tidyLayout(tree, SLOT, TOP, LEVEL);
  const width = Math.max(4, shape.leaves, slots) * SLOT;
  const height = TOP + (shape.levels - 1) * LEVEL + NODE / 2 + 8;
  const byId = new Map(tree.map((node) => [node.id, node]));

  const filled = path.reduce((sum, pick) => sum + pick, 0);

  return (
    <ViewRoot>
      <Svg width={width} height={height}>
        {tree
          .filter((node) => node.parent !== null)
          .map((node) => {
            const parent = byId.get(node.parent!)!;
            const onPath = (node.status === "path" || node.id === current) && node.status !== "cut" && !done;
            return (
              <Edge
                key={`e${node.id}`}
                from={positions.get(parent.id)!}
                to={positions.get(node.id)!}
                tone={node.status === "cut" ? "past" : onPath ? "path" : "plain"}
                inset={NODE / 2}
              />
            );
          })}
        {tree
          .filter((node) => node.parent !== null && node.pick !== null)
          .map((node) => (
            <EdgeLabel
              key={`l${node.id}`}
              from={positions.get(node.parent!)!}
              to={positions.get(node.id)!}
              text={`+${node.pick}`}
            />
          ))}
        {tree.map((node) => (
          <Node
            key={node.id}
            at={positions.get(node.id)!}
            label={node.status === "cut" ? node.pick ?? "" : node.remaining}
            state={stateOf(node, current, done)}
            size={NODE}
            badge={node.status === "found" ? "✓" : node.status === "cut" ? "✂" : undefined}
          />
        ))}
      </Svg>

      <div className={styles.sum} style={{ "--target": target } as CSSProperties}>
        <span className={styles.sumLabel}>
          path {path.length ? path.join(" + ") : "empty"} = {filled} of {target}
        </span>
        <div className={styles.bar}>
          {path.map((pick, idx) => (
            <span key={idx} className={styles.segment} style={{ "--units": pick } as CSSProperties}>
              {pick}
            </span>
          ))}
          {remaining > 0 && (
            <span className={styles.rest} style={{ "--units": remaining } as CSSProperties}>
              need {remaining}
            </span>
          )}
        </div>
      </div>

      <div className={styles.results}>
        <span className={styles.resultsLabel}>found</span>
        <Chips empty="nothing yet">
          {results.map((combo) => (
            <Chip key={combo.join("+")} state="found">
              [{combo.join(", ")}] ✓
            </Chip>
          ))}
        </Chips>
      </div>

      <Stats
        items={[
          { label: "path", value: path.length ? `[${path.join(", ")}]` : "[]" },
          { label: "remaining", value: remaining },
          { label: "found", value: results.length, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
