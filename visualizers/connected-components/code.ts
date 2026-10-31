export const code: string[] = [
  "function countComponents(n: number, links: number[][]): number {", // 0
  "  const parent = Array.from({ length: n }, (_, i) => i);", // 1
  "  const find = (x: number): number => {", // 2
  "    if (parent[x] !== x) parent[x] = find(parent[x]);", // 3
  "    return parent[x];", // 4
  "  };", // 5
  "  let groups = n;", // 6
  "  for (const [a, b] of links) {", // 7
  "    const leaderA = find(a);", // 8
  "    const leaderB = find(b);", // 9
  "    if (leaderA === leaderB) continue;", // 10
  "    parent[leaderB] = leaderA;", // 11
  "    groups--;", // 12
  "  }", // 13
  "  return groups;", // 14
  "}", // 15
];
