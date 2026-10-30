import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def max_depth(root: TreeNode | None) -> int:",
    "    if root is None:",
    "        return 0",
    "    left = max_depth(root.left)",
    "    right = max_depth(root.right)",
    "    return 1 + max(left, right)",
  ],
  lines: [0, 1, 3, 4, 5, -1],
};
