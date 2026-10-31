import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def network_delay(n: int, links: list[list[int]], start: int) -> int:",
    "    roads = [[] for _ in range(n)]",
    "    for origin, to, cost in links:",
    "        roads[origin].append((to, cost))",
    "    best = [inf] * n",
    "    best[start] = 0",
    "    heap = [(0, start)]",
    "    while heap:",
    "        time, node = heappop(heap)",
    "        if time > best[node]:",
    "            continue",
    "        for to, cost in roads[node]:",
    "            arrive = time + cost",
    "            if arrive < best[to]:",
    "                best[to] = arrive",
    "                heappush(heap, (arrive, to))",
    "    slowest = max(best)",
    "    return -1 if slowest == inf else slowest",
  ],
  lines: [0, 1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, -1, -1, -1, 16, 17, -1],
};
