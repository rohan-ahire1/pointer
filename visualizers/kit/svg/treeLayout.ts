/**
 * Layout helpers for the SVG views (trees, heaps, tries, decision trees).
 * All coordinates are in viewBox units; views scale the SVG to their width.
 */

export type Point = { x: number; y: number };

/** Vertical distance between tree levels, and the default node diameter. */
export const LEVEL_GAP = 72;
export const NODE_SIZE = 44;

/**
 * Position of a node in a complete-binary-tree layout, from its heap position
 * (root 1, children 2p and 2p + 1). Every level is spread evenly across
 * `width`, so a tree up to `maxDepth` levels never overlaps.
 */
export function heapPosition(pos: number, width: number, top = NODE_SIZE / 2 + 4): Point {
  const level = Math.floor(Math.log2(pos));
  const slots = 2 ** level;
  const index = pos - slots;
  return { x: ((index + 0.5) / slots) * width, y: top + level * LEVEL_GAP };
}

/** Heap position of an array-backed heap index (0 → 1, children 2k + 1 and 2k + 2). */
export const heapIndexToPos = (index: number): number => index + 1;

export type TidyNode = { id: number; parent: number | null };

/**
 * A tidy layout for an arbitrary tree: leaves take consecutive x slots in
 * depth-first order (children in the order given), and each parent is
 * centred over its children. Returns positions keyed by id, plus the number
 * of leaf slots and levels so the caller can size its viewBox.
 */
export function tidyLayout(
  nodes: readonly TidyNode[],
  slotWidth: number,
  top = NODE_SIZE / 2 + 4,
): { positions: Map<number, Point>; slots: number; levels: number } {
  const children = new Map<number, number[]>();
  let root: number | null = null;
  for (const node of nodes) {
    if (node.parent === null) {
      root = node.id;
    } else {
      const list = children.get(node.parent) ?? [];
      list.push(node.id);
      children.set(node.parent, list);
    }
  }

  const positions = new Map<number, Point>();
  if (root === null) return { positions, slots: 0, levels: 0 };

  let nextSlot = 0;
  let levels = 0;
  const place = (id: number, depth: number): number => {
    levels = Math.max(levels, depth + 1);
    const kids = children.get(id) ?? [];
    let x: number;
    if (kids.length === 0) {
      x = (nextSlot + 0.5) * slotWidth;
      nextSlot += 1;
    } else {
      const xs = kids.map((kid) => place(kid, depth + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    positions.set(id, { x, y: top + depth * LEVEL_GAP });
    return x;
  };
  place(root, 0);

  return { positions, slots: nextSlot, levels };
}
