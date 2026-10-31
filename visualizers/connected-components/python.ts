import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def count_components(n: int, links: list[list[int]]) -> int:",
    "    parent = list(range(n))",
    "    def find(x: int) -> int:",
    "        if parent[x] != x:",
    "            parent[x] = find(parent[x])",
    "        return parent[x]",
    "    groups = n",
    "    for a, b in links:",
    "        leader_a = find(a)",
    "        leader_b = find(b)",
    "        if leader_a == leader_b:",
    "            continue",
    "        parent[leader_b] = leader_a",
    "        groups -= 1",
    "    return groups",
  ],
  lines: [0, 1, 2, 3, 5, -1, 6, 7, 8, 9, 10, 12, 13, -1, 14, -1],
};
