# 08 · Tries — Implement Trie (Prefix Tree)

- **Visualizer id:** `implement-trie` · **Folder:** `visualizers/implement-trie/`
- **Title:** "Implement Trie (Prefix Tree)"
- **Story:** words that start the same share the same path. Inserting reuses what's there; searching walks letter by letter.

## Input
- `inputLabel`: `words | query =` · `inputMaxLength`: 40
- `inputHint`: `Up to 4 words of 1–6 letters (a–z), then | and a word to look up.`
- Presets and expected answers (`search`, `startsWith`):
  - `car cat cart | ca` → `false`, `true` (the explainer's example: the trie branches, and a prefix isn't a word)
  - `apple app | app` → `true`, `true`
  - `tea ten to | tex` → `false`, `false`

## Reference solution
```ts
class TrieNode {
  children = new Map<string, TrieNode>();
  isWord = false;
}

function insert(root: TrieNode, word: string) {
  let node = root;
  for (const ch of word) {
    if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
    node = node.children.get(ch)!;
  }
  node.isWord = true;
}

function search(root: TrieNode, word: string, prefix = false) {
  let node = root;
  for (const ch of word) {
    const next = node.children.get(ch);
    if (!next) return false;
    node = next;
  }
  return prefix || node.isWord;
}
```

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 0, 1, 2 | Start with an empty root. |
| new node | 7, 8, 9 | ‘p’ isn’t under ‘a’ yet. Add a new node. |
| reuse | 7, 9 | ‘a’ is already there from “apple”. Follow it. |
| mark | 11 | “app” ends at this ‘p’. Mark it ★. |
| walk | 16, 17, 19 | Look up ‘c’: it’s there. Follow it. |
| fail | 17, 18 | ‘x’ isn’t under ‘e’. “tex” isn’t in the trie. |
| verdict | 21 | “ca” ends on an unmarked node. search is false, startsWith is true. |
| done | 21 | Done. search(“ca”) is false and startsWith(“ca”) is true. |

The single lookup walk answers both `search` and `startsWith` (same path; only the last check differs).
`sr` example: `Inserting “app”, letter 2 of 3, ‘p’. Reused 2 nodes. Trie has 6 nodes.`
State: `{ words, query, nodes: { id, ch, parent, isWord }[], cursor: id | null, phase: "insert" | "search", wordIndex, charIndex, created: id | null, result: { search: boolean, startsWith: boolean } | null }`.

## View
- **Word chips** on top: each word, then `|`, then the query. The current word/letter is highlighted (orange letter inside the chip); finished words get ✓.
- **SVG trie** (`viewBox`, width 100%): root is a small `·` node at the top, then one level per letter (≤ 7 levels). Tidy layout: leaves take
  consecutive x slots and parents centre over their children. Keep nodes keyed by id so a relayout slides them (`--dur-slow`).
  Nodes are 36px circles with the letter. **Word ends have a double ring and a ★ badge** (never colour alone).
- The cursor node is orange; edges on the path from the root to the cursor are drawn 3px `--orange`. A new node scales in from 0.8.
- On a failed lookup, a dashed ghost node with the missing letter and `✕` hangs off the last node for that step.
- **Stats:** `word` · `nodes` · answer tile `search · startsWith` (e.g. `false · true`).

## Tests: brute force
`search = words.includes(query)`, `startsWith = words.some(w => w.startsWith(query))`. Also assert the node count equals the number of distinct prefixes of the words.

## Content direction
- Analogy seed: phone autocomplete, or a dictionary's thumb tabs. After two letters you're already on the right page for every word that starts that way.
- `needs`: trees, hash maps. `complexity`: `O(L)` per operation (L = word length).
- Problems: implement-trie-prefix-tree (visualized), design-add-and-search-words-data-structure, word-search-ii.
