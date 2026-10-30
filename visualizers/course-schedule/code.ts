export const code: string[] = [
  "function canFinish(n: number, prereqs: number[][]): boolean {", // 0
  "  const next: number[][] = Array.from({ length: n }, () => []);", // 1
  "  const needs = new Array(n).fill(0);", // 2
  "  for (const [course, before] of prereqs) {", // 3
  "    next[before].push(course);", // 4
  "    needs[course]++;", // 5
  "  }", // 6
  "  const ready: number[] = [];", // 7
  "  for (let c = 0; c < n; c++) if (needs[c] === 0) ready.push(c);", // 8
  "  let taken = 0;", // 9
  "  while (ready.length) {", // 10
  "    const c = ready.shift()!;", // 11
  "    taken++;", // 12
  "    for (const after of next[c]) {", // 13
  "      needs[after]--;", // 14
  "      if (needs[after] === 0) ready.push(after);", // 15
  "    }", // 16
  "  }", // 17
  "  return taken === n;", // 18
  "}", // 19
];
