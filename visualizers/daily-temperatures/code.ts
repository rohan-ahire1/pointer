export const code: string[] = [
  "function dailyTemperatures(temps: number[]): number[] {", // 0
  "  const out = new Array(temps.length).fill(0);", // 1
  "  const stack: number[] = []; // days still waiting", // 2
  "  for (let i = 0; i < temps.length; i++) {", // 3
  "    while (stack.length && temps[i] > temps[stack.at(-1)!]) {", // 4
  "      const day = stack.pop()!;", // 5
  "      out[day] = i - day;", // 6
  "    }", // 7
  "    stack.push(i);", // 8
  "  }", // 9
  "  return out;", // 10
  "}", // 11
];
