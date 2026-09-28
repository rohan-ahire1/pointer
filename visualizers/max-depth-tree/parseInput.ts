import type { MaxDepthInput, TreeNodeData } from "./types";
import { stripPasteSyntax } from "../kit/paste";

const NULL_SPELLINGS = new Set(["null", "_", "#"]);

/**
 * Input rules (docs/patterns/07-trees.md): LeetCode-style level order —
 * values -99..99 with `null` (also `_` or `#`) for a missing child — up to
 * 15 nodes and 4 levels. Queue-based parsing: the first token is the root,
 * then for each node in BFS order the next two tokens are its left and right
 * child. Parsing stops when the tokens run out; `pos` (root 1, children 2p
 * and 2p + 1) and `depth` (root 1) are derived from the structure for
 * layout. Every error says what *is* allowed.
 */
export function parseInput(input: string): MaxDepthInput | { error: string } {
  const raw = stripPasteSyntax(input);
  const empty = { error: "Enter level order values like 3 9 20 null null 15 7. Up to 4 levels." };
  if (raw.trim() === "") return empty;
  const tokens = raw.trim().split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length === 0) return empty;

  const slots: (number | null)[] = [];
  for (const token of tokens) {
    if (NULL_SPELLINGS.has(token.toLowerCase())) {
      slots.push(null);
      continue;
    }
    if (!/^-?\d+$/.test(token)) {
      return { error: `“${token}” isn’t a value. Use numbers from -99 to 99, or null for a missing child.` };
    }
    const v = Number(token);
    if (v < -99 || v > 99) {
      return { error: `${v} is out of range. Use numbers from -99 to 99, or null for a missing child.` };
    }
    slots.push(v);
  }
  if (slots[0] === null) {
    return { error: "The root can’t be null. Start with a number from -99 to 99." };
  }

  const rootValue = slots[0] as number;
  const nodes: TreeNodeData[] = [
    { id: 0, value: rootValue, left: null, right: null, pos: 1, depth: 1 },
  ];
  const queue: TreeNodeData[] = [nodes[0] as TreeNodeData];
  let head = 0;
  let index = 1;
  while (head < queue.length && index < slots.length) {
    const parent = queue[head] as TreeNodeData;
    head++;
    for (const side of ["left", "right"] as const) {
      if (index >= slots.length) break;
      const slot = slots[index] as number | null;
      index++;
      if (slot === null) continue;
      const childDepth = parent.depth + 1;
      if (childDepth > 4) {
        return { error: `That tree is ${childDepth} levels deep. Keep it to 4 levels and 15 nodes.` };
      }
      const childPos = side === "left" ? parent.pos * 2 : parent.pos * 2 + 1;
      const child: TreeNodeData = {
        id: nodes.length,
        value: slot,
        left: null,
        right: null,
        pos: childPos,
        depth: childDepth,
      };
      nodes.push(child);
      if (nodes.length > 15) {
        return { error: `That tree has ${nodes.length} nodes. Keep it to 15 nodes in 4 levels.` };
      }
      parent[side] = child.id;
      queue.push(child);
    }
  }
  if (index < slots.length) {
    const leftover = tokens[index] as string;
    return {
      error: `Token ${index + 1} (“${leftover}”) has no parent to attach to. Drop the leftover tokens and use level order like 3 9 20 null null 15 7, with up to 15 nodes in 4 levels.`,
    };
  }
  return { nodes, root: 0 };
}
