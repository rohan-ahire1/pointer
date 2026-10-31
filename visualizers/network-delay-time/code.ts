export const code: string[] = [
  "function networkDelay(n: number, links: number[][], start: number): number {", // 0
  "  const roads: number[][][] = Array.from({ length: n }, () => []);", // 1
  "  for (const [from, to, cost] of links) roads[from].push([to, cost]);", // 2
  "  const best = new Array(n).fill(Infinity);", // 3
  "  best[start] = 0;", // 4
  "  const heap = new MinHeap([[0, start]]);", // 5
  "  while (heap.size > 0) {", // 6
  "    const [time, node] = heap.pop();", // 7
  "    if (time > best[node]) continue;", // 8
  "    for (const [to, cost] of roads[node]) {", // 9
  "      const arrive = time + cost;", // 10
  "      if (arrive < best[to]) {", // 11
  "        best[to] = arrive;", // 12
  "        heap.push([arrive, to]);", // 13
  "      }", // 14
  "    }", // 15
  "  }", // 16
  "  const slowest = Math.max(...best);", // 17
  "  return slowest === Infinity ? -1 : slowest;", // 18
  "}", // 19
];
