import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def is_valid(s: str) -> bool:",
    "    stack = []",
    "    pairs = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}",
    "    for ch in s:",
    "        if ch not in pairs:",
    "            stack.append(ch)",
    "        elif not stack or stack.pop() != pairs[ch]:",
    "            return False",
    "    return not stack",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, 7, -1, -1, 8, -1],
};
