import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def can_finish(n: int, prereqs: list[list[int]]) -> bool:",
    "    next_up = [[] for _ in range(n)]",
    "    needs = [0] * n",
    "    for course, before in prereqs:",
    "        next_up[before].append(course)",
    "        needs[course] += 1",
    "    ready = deque(c for c in range(n) if needs[c] == 0)",
    "    taken = 0",
    "    while ready:",
    "        c = ready.popleft()",
    "        taken += 1",
    "        for after in next_up[c]:",
    "            needs[after] -= 1",
    "            if needs[after] == 0:",
    "                ready.append(after)",
    "    return taken == n",
  ],
  lines: [0, 1, 2, 3, 4, 5, -1, 6, 6, 7, 8, 9, 10, 11, 12, 13, -1, -1, 15, -1],
};
