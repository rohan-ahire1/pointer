export const code: string[] = [
  "function minWindow(s: string, t: string): string {", // 0
  "  const need = new Map<string, number>();", // 1
  "  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);", // 2
  "  let missing = need.size, left = 0, best = \"\";", // 3
  "  for (let right = 0; right < s.length; right++) {", // 4
  "    const ch = s[right];", // 5
  "    if (need.has(ch)) {", // 6
  "      need.set(ch, need.get(ch)! - 1);", // 7
  "      if (need.get(ch) === 0) missing--;", // 8
  "    }", // 9
  "    while (missing === 0) {", // 10
  "      if (!best || right - left + 1 < best.length) best = s.slice(left, right + 1);", // 11
  "      const out = s[left++];", // 12
  "      if (need.has(out)) {", // 13
  "        if (need.get(out) === 0) missing++;", // 14
  "        need.set(out, need.get(out)! + 1);", // 15
  "      }", // 16
  "    }", // 17
  "  }", // 18
  "  return best;", // 19
  "}", // 20
];
