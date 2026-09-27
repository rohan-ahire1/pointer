# 07 · Trees — Maximum Depth of Binary Tree

- **Visualizer id:** `max-depth-binary-tree` · **Folder:** `visualizers/max-depth-tree/`
- **Title:** "Maximum Depth of Binary Tree"
- **Story:** ask each child how deep it goes, take the deeper answer, add one for yourself. The answers bubble up from the leaves.

## Input
- `inputLabel`: `root =` · `inputMaxLength`: 60
- `inputHint`: `Level order, like LeetCode: 3 9 20 null null 15 7. Up to 4 levels.`
- LeetCode serialization: values -99..99, `null` for a missing child (also accept `_` and `#`), and children of a missing node are skipped.
  The root can't be null. Up to 15 nodes, depth ≤ 4, with a friendly error otherwise.
- Presets and expected answers:
  - `3 9 20 null null 15 7` → `3`
  - `1 null 2` → `2`
  - `1 2 3 4 5 6 7` → `3`

## Reference solution
```ts
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;
  const left = maxDepth(root.left);
  const right = maxDepth(root.right);
  return 1 + Math.max(left, right);
}
```

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 0 | Ask the root, 3, how deep its tree goes. |
| enter | 0, 2 or 3 | Go down to 20. First ask its left side. |
| leaf | 1, 4 | 9 is a leaf. Both sides are empty, so it’s 1 deep. |
| missing child | 1 | 2 has no left child. An empty tree is 0 deep. |
| return | 4 | 20 takes its deeper side, 1, plus itself: 2. |
| done | 4 | Done. The root answers 3: the tree is 3 levels deep. |

A leaf's two empty children are **one** step (the leaf row), not three. A non-leaf's single missing child gets its own short step.
`sr` example: `At 20, depth 2 from the root. Call stack: 3, 20. 9 answered 1. Waiting on 20's left.`
State: `{ nodes: { id, value, left, right, depth }[], stack: number[] (node ids, root first), answers: Record<id, number>, current: id | null, probe: { parent, side } | null }`.

## View
- **SVG tree** (`viewBox`, width 100%): node x/y from `kit/svg/treeLayout.ts` using the heap position (root 1, children 2i and 2i+1) and depth ≤ 4.
  Nodes are 44px circles; edges are 2px `--line`.
- Node states: waiting (card) · on the call stack (`range`: `--tint-yellow`, like the window capsule) · current (orange, `r` +3 lift via scale 1.1) · answered (mint, with a small badge showing its depth, e.g. `2`).
- A missing child being checked is drawn as a small dashed `∅` ghost node for that step.
- **Call stack panel** beside the tree (under it on phones): frames `maxDepth(3)`, `maxDepth(20)` stacked bottom-up, top frame highlighted; a returning frame shows `→ 2` then leaves.
- **Stats:** `node` · `stack depth` · answer tile `max depth`.

## Tests: brute force
Level-order BFS counting levels. The generator builds random trees within the limits and serializes them LeetCode-style, so `parseInput` gets exercised too.

## Content direction
- Analogy seed: a family tree. To find how many generations it spans, each person asks their children and adds one.
- `needs`: recursion. `complexity`: `O(n)`.
- Problems: invert-binary-tree and maximum-depth-of-binary-tree (warm-ups; max depth is the visualized one), same-tree, subtree-of-another-tree, lowest-common-ancestor-of-a-bst, binary-tree-level-order-traversal, validate-binary-search-tree, kth-smallest-element-in-a-bst, construct-binary-tree-from-preorder-and-inorder, binary-tree-maximum-path-sum, serialize-and-deserialize-binary-tree.
