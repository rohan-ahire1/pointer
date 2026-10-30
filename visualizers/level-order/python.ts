import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def level_order(root: TreeNode | None) -> list[list[int]]:",
    "    if root is None:",
    "        return []",
    "    out = []",
    "    queue = [root]",
    "    while queue:",
    "        level = []",
    "        next_queue = []",
    "        for node in queue:",
    "            level.append(node.val)",
    "            if node.left:",
    "                next_queue.append(node.left)",
    "            if node.right:",
    "                next_queue.append(node.right)",
    "        out.append(level)",
    "        queue = next_queue",
    "    return out",
  ],
  lines: [0, 1, 3, 4, 5, 6, 7, 8, 9, 11, 13, -1, 14, 15, -1, 16, -1],
};
