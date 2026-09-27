/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/08-tries.md.
 */
export const code: string[] = [
  "class TrieNode {", // 0
  "  children = new Map<string, TrieNode>();", // 1
  "  isWord = false;", // 2
  "}", // 3
  "", // 4
  "function insert(root: TrieNode, word: string) {", // 5
  "  let node = root;", // 6
  "  for (const ch of word) {", // 7
  "    if (!node.children.has(ch)) node.children.set(ch, new TrieNode());", // 8
  "    node = node.children.get(ch)!;", // 9
  "  }", // 10
  "  node.isWord = true;", // 11
  "}", // 12
  "", // 13
  "function search(root: TrieNode, word: string, prefix = false) {", // 14
  "  let node = root;", // 15
  "  for (const ch of word) {", // 16
  "    const next = node.children.get(ch);", // 17
  "    if (!next) return false;", // 18
  "    node = next;", // 19
  "  }", // 20
  "  return prefix || node.isWord;", // 21
  "}", // 22
];
