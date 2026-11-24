import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "class TrieNode:",
    "    def __init__(self):",
    "        self.children = {}",
    "        self.is_word = False",
    "",
    "def add_word(root: TrieNode, word: str) -> None:",
    "    node = root",
    "    for ch in word:",
    "        if ch not in node.children:",
    "            node.children[ch] = TrieNode()",
    "        node = node.children[ch]",
    "    node.is_word = True",
    "",
    "def search(root: TrieNode, pattern: str) -> bool:",
    "    def dfs(node: TrieNode, i: int) -> bool:",
    "        if i == len(pattern):",
    "            return node.is_word",
    "        ch = pattern[i]",
    '        if ch == ".":',
    "            for child in node.children.values():",
    "                if dfs(child, i + 1):",
    "                    return True",
    "            return False",
    "        nxt = node.children.get(ch)",
    "        return nxt is not None and dfs(nxt, i + 1)",
    "    return dfs(root, 0)",
  ],
  lines: [0, 2, 3, -1, 4, 5, 6, 7, 8, 10, -1, 11, -1, 12, 13, 14, 15, 17, 18, 19, 20, -1, 22, -1, 23, 24, -1, 25, -1],
};
