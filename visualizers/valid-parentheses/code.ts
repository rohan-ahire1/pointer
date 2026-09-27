/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/04-stack.md.
 */
export const code: string[] = [
  "function isValid(s: string): boolean {", // 0
  "  const stack: string[] = [];", // 1
  '  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };', // 2
  "  for (const ch of s) {", // 3
  "    if (!(ch in pairs)) {", // 4
  "      stack.push(ch);", // 5
  "    } else if (stack.pop() !== pairs[ch]) {", // 6
  "      return false;", // 7
  "    }", // 8
  "  }", // 9
  "  return stack.length === 0;", // 10
  "}", // 11
];
