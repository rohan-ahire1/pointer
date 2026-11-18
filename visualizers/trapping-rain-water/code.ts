export const code: string[] = [
  "function trap(height: number[]): number {", // 0
  "  const stack: number[] = []; // bars that could be a left wall", // 1
  "  let water = 0;", // 2
  "  for (let i = 0; i < height.length; i++) {", // 3
  "    while (stack.length && height[i] > height[stack.at(-1)!]) {", // 4
  "      const floor = stack.pop()!;", // 5
  "      if (!stack.length) break; // no left wall: it runs off", // 6
  "      const left = stack.at(-1)!;", // 7
  "      const depth = Math.min(height[left], height[i]) - height[floor];", // 8
  "      water += depth * (i - left - 1);", // 9
  "    }", // 10
  "    stack.push(i);", // 11
  "  }", // 12
  "  return water;", // 13
  "}", // 14
];
