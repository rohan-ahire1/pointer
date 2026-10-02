import type { Step } from "../types";
import type { MaxDepthInput, MaxDepthState, TreeNodeData } from "./types";

/**
 * Traced Maximum Depth of Binary Tree (docs/patterns/07-trees.md): ask each
 * child how deep it goes, take the deeper answer, add one. Pure and
 * deterministic — the same tree always yields the same steps. A leaf's two
 * empty children collapse into its single leaf step; only a non-leaf's lone
 * missing child gets its own short step.
 */
export function trace(input: MaxDepthInput): Step<MaxDepthState>[] {
  const nodes = input.nodes.map((node) => ({ ...node }));
  const byId: Record<number, TreeNodeData> = {};
  for (const node of nodes) byId[node.id] = node;
  const out: Step<MaxDepthState>[] = [];
  const stack: number[] = [];
  const answers: Record<number, number> = {};
  const stackValues = (): string => stack.map((id) => byId[id].value).join(", ");
  const push = (
    phase: MaxDepthState["phase"],
    current: number | null,
    probe: MaxDepthState["probe"],
    answer: number | null,
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        nodes: nodes.map((node) => ({ ...node })),
        stack: [...stack],
        answers: { ...answers },
        current,
        probe: probe === null ? null : { ...probe },
        phase,
        answer,
      },
      lines,
      note,
      sr,
    });
  };

  /** Trace one frame: answer leaves at once, otherwise ask both sides. */
  const solve = (u: number): number => {
    const node = byId[u];
    const left = node.left;
    const right = node.right;
    if (left === null && right === null) {
      answers[u] = 1;
      push(
        "leaf",
        u,
        null,
        null,
        [1, 4],
        `${node.value} is a leaf. Both sides are empty, so it’s 1 deep.`,
        `At ${node.value}, depth ${node.depth} from the root. Call stack: ${stackValues()}. Both sides empty. ${node.value} answers 1.`,
      );
      stack.pop();
      return 1;
    }
    let l: number;
    if (left === null) {
      push(
        "missing",
        u,
        { parent: u, side: "left" },
        null,
        [1],
        `${node.value} has no left child. An empty tree is 0 deep.`,
        `At ${node.value}, depth ${node.depth} from the root. Call stack: ${stackValues()}. No left child. An empty tree answers 0.`,
      );
      l = 0;
    } else {
      stack.push(left);
      push(
        "enter",
        left,
        null,
        null,
        [0, 2],
        `Ask ${node.value}’s left side first: go down to ${byId[left].value}.`,
        `At ${byId[left].value}, depth ${byId[left].depth} from the root. Call stack: ${stackValues()}. Waiting on ${node.value}’s left.`,
      );
      l = solve(left);
    }
    let r: number;
    if (right === null) {
      push(
        "missing",
        u,
        { parent: u, side: "right" },
        null,
        [1],
        `${node.value} has no right child. An empty tree is 0 deep.`,
        `At ${node.value}, depth ${node.depth} from the root. Call stack: ${stackValues()}. No right child. An empty tree answers 0.`,
      );
      r = 0;
    } else {
      stack.push(right);
      push(
        "enter",
        right,
        null,
        null,
        [0, 3],
        left === null
          ? `No left child. Go down to ${byId[right].value} for the right side.`
          : `Left side answered ${l}. Go down to ${byId[right].value} for the right side.`,
        `At ${byId[right].value}, depth ${byId[right].depth} from the root. Call stack: ${stackValues()}. Waiting on ${node.value}’s right.`,
      );
      r = solve(right);
    }
    const answer = 1 + Math.max(l, r);
    answers[u] = answer;
    push(
      "return",
      u,
      null,
      null,
      [4],
      l === r
        ? `${node.value} takes either side, ${l}, plus itself: ${answer}.`
        : `${node.value} takes its deeper side, ${Math.max(l, r)}, plus itself: ${answer}.`,
      `At ${node.value}. Call stack: ${stackValues()}. Left answered ${l}, right answered ${r}. ${node.value} answers ${answer}.`,
    );
    stack.pop();
    return answer;
  };

  stack.push(input.root);
  push(
    "setup",
    input.root,
    null,
    null,
    [0],
    `Ask the root, ${byId[input.root].value}, how deep its tree goes.`,
    `At ${byId[input.root].value}, depth 1. Call stack: ${byId[input.root].value}. Asking how deep it goes.`,
  );
  const answer = solve(input.root);
  push(
    "done",
    null,
    null,
    answer,
    [4],
    `Done. The root answers ${answer}: the tree is ${answer} ${answer === 1 ? "level" : "levels"} deep.`,
    `Done. The root answers ${answer}. The tree is ${answer} ${answer === 1 ? "level" : "levels"} deep.`,
  );
  return out;
}
