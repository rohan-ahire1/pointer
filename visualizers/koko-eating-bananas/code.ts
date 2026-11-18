export const code: string[] = [
  "function minEatingSpeed(piles: number[], h: number): number {", // 0
  "  let lo = 1, hi = Math.max(...piles);", // 1
  "  while (lo < hi) {", // 2
  "    const k = Math.floor((lo + hi) / 2);", // 3
  "    let hours = 0;", // 4
  "    for (const p of piles) hours += Math.ceil(p / k);", // 5
  "    if (hours <= h) hi = k; // fast enough: try slower", // 6
  "    else lo = k + 1; // too slow: go faster", // 7
  "  }", // 8
  "  return lo;", // 9
  "}", // 10
];
