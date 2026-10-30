import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def min_window(s: str, t: str) -> str:",
    "    need = Counter(t)",
    "    missing = len(need)",
    "    left = 0",
    "    best = \"\"",
    "    for right, ch in enumerate(s):",
    "        if ch in need:",
    "            need[ch] -= 1",
    "            if need[ch] == 0:",
    "                missing -= 1",
    "        while missing == 0:",
    "            if not best or right - left + 1 < len(best):",
    "                best = s[left:right + 1]",
    "            out = s[left]",
    "            left += 1",
    "            if out in need:",
    "                if need[out] == 0:",
    "                    missing += 1",
    "                need[out] += 1",
    "    return best",
  ],
  lines: [0, 1, 1, 2, 5, 5, 6, 7, 8, -1, 10, 11, 13, 15, 16, 18, -1, -1, -1, 19, -1],
};
