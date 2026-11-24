/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 */
export const code: string[] = [
  "class TrieNode {", // 0
  "  children = new Map<string, TrieNode>();", // 1
  "  isWord = false;", // 2
  "}", // 3
  "", // 4
  "function addWord(root: TrieNode, word: string) {", // 5
  "  let node = root;", // 6
  "  for (const ch of word) {", // 7
  "    if (!node.children.has(ch)) node.children.set(ch, new TrieNode());", // 8
  "    node = node.children.get(ch)!;", // 9
  "  }", // 10
  "  node.isWord = true;", // 11
  "}", // 12
  "", // 13
  "function search(root: TrieNode, pattern: string): boolean {", // 14
  "  function dfs(node: TrieNode, i: number): boolean {", // 15
  "    if (i === pattern.length) return node.isWord;", // 16
  "    const ch = pattern[i];", // 17
  '    if (ch === ".") {', // 18
  "      for (const child of node.children.values()) {", // 19
  "        if (dfs(child, i + 1)) return true;", // 20
  "      }", // 21
  "      return false;", // 22
  "    }", // 23
  "    const next = node.children.get(ch);", // 24
  "    return next !== undefined && dfs(next, i + 1);", // 25
  "  }", // 26
  "  return dfs(root, 0);", // 27
  "}", // 28
];
