export const code: string[] = [
  "function levelOrder(root: TreeNode | null): number[][] {", // 0
  "  if (!root) return [];", // 1
  "  const out: number[][] = [];", // 2
  "  let queue = [root];", // 3
  "  while (queue.length) {", // 4
  "    const level: number[] = [];", // 5
  "    const next: TreeNode[] = [];", // 6
  "    for (const node of queue) {", // 7
  "      level.push(node.val);", // 8
  "      if (node.left) next.push(node.left);", // 9
  "      if (node.right) next.push(node.right);", // 10
  "    }", // 11
  "    out.push(level);", // 12
  "    queue = next;", // 13
  "  }", // 14
  "  return out;", // 15
  "}", // 16
];
