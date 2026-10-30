import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "class TrieNode:",
    "    def __init__(self):",
    "        self.children = {}",
    "        self.is_word = False",
    "",
    "def insert(root: TrieNode, word: str) -> None:",
    "    node = root",
    "    for ch in word:",
    "        if ch not in node.children:",
    "            node.children[ch] = TrieNode()",
    "        node = node.children[ch]",
    "    node.is_word = True",
    "",
    "def search(root: TrieNode, word: str, prefix=False) -> bool:",
    "    node = root",
    "    for ch in word:",
    "        nxt = node.children.get(ch)",
    "        if nxt is None:",
    "            return False",
    "        node = nxt",
    "    return prefix or node.is_word",
  ],
  lines: [0, 2, 3, -1, 4, 5, 6, 7, 8, 10, -1, 11, -1, 12, 13, 14, 15, 16, 17, 19, -1, 20, -1],
};
