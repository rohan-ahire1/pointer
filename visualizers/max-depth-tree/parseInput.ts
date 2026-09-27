import type { MaxDepthInput, TreeNodeData } from "./types";

const NULL_SPELLINGS = new Set(["null", "_", "#"]);

/**
 * Input rules (docs/patterns/07-trees.md): LeetCode-style level order —
 * values -99..99 with `null` (also `_` or `#`) for a missing child — up to
 * 15 nodes and 4 levels. Token index i sits at heap position i + 1, and a
 * token whose ancestor slot is missing is skipped (children of a missing
 * node are skipped). Every error says what *is* allowed.
 */
export function parseInput(raw: string): MaxDepthInput | { error: string } {
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

  const nodes: TreeNodeData[] = [];
  const idAt = new Map<number, number>();
  for (let i = 0; i < slots.length; i++) {
    const pos = i + 1;
    const slot = slots[i];
    if (slot === null) continue;
    // A value counts only when its parent slot holds a node; anything under
    // a missing node is skipped, transitively.
    if (pos !== 1 && !idAt.has(Math.floor(pos / 2))) continue;
    const depth = Math.floor(Math.log2(pos)) + 1;
    if (depth > 4) {
      return { error: `That tree is ${depth} levels deep. Keep it to 4 levels and 15 nodes.` };
    }
    idAt.set(pos, nodes.length);
    nodes.push({ id: nodes.length, value: slot, left: null, right: null, pos, depth });
  }
  if (nodes.length > 15) {
    return { error: `That tree has ${nodes.length} nodes. Keep it to 15 nodes in 4 levels.` };
  }
  for (const node of nodes) {
    const leftId = idAt.get(node.pos * 2);
    const rightId = idAt.get(node.pos * 2 + 1);
    node.left = leftId === undefined ? null : leftId;
    node.right = rightId === undefined ? null : rightId;
  }
  return { nodes, root: 0 };
}
