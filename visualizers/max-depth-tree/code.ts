/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/07-trees.md.
 */
export const code: string[] = [
  "function maxDepth(root: TreeNode | null): number {", // 0
  "  if (root === null) return 0;", // 1
  "  const left = maxDepth(root.left);", // 2
  "  const right = maxDepth(root.right);", // 3
  "  return 1 + Math.max(left, right);", // 4
  "}", // 5
];
