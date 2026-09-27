import type { Step } from "../types";
import type { TrieInput, TrieNodeData, TrieState } from "./types";

/**
 * Traced Implement Trie (docs/patterns/08-tries.md): insert every word,
 * reusing nodes already there, then walk the query letter by letter. The
 * single lookup answers both `search` and `startsWith` — same path, only
 * the last check differs. Pure and deterministic.
 */
export function trace(input: TrieInput): Step<TrieState>[] {
  const { words, query } = input;
  const out: Step<TrieState>[] = [];
  const nodes: TrieNodeData[] = [{ id: 0, ch: "", parent: null, isWord: false }];
  // Which word first created each node, so a reuse step can name it.
  const createdBy = new Map<number, string>();
  const childOf = (id: number, ch: string): TrieNodeData | undefined =>
    nodes.find((node) => node.parent === id && node.ch === ch);

  const q = (c: string) => `‘${c}’`;
  const qq = (s: string) => `“${s}”`;
  const count = () => nodes.length - 1;
  const push = (
    cursor: number | null,
    phase: TrieState["phase"],
    wordIndex: number | null,
    charIndex: number | null,
    created: number | null,
    missing: string | null,
    result: { search: boolean; startsWith: boolean } | null,
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        words: [...words],
        query,
        nodes: nodes.map((node) => ({ ...node })),
        cursor,
        phase,
        wordIndex,
        charIndex,
        created,
        missing,
        result: result === null ? null : { ...result },
      },
      lines,
      note,
      sr,
    });
  };

  push(
    null,
    "setup",
    null,
    null,
    null,
    null,
    null,
    [0, 1, 2],
    "Start with an empty root.",
    `Empty trie, just a root node. ${words.length} ${words.length === 1 ? "word" : "words"} to insert, then look up ${qq(query)}.`,
  );

  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    let node = 0;
    let reused = 0;
    for (let c = 0; c < word.length; c++) {
      const ch = word[c];
      const existing = childOf(node, ch);
      if (existing === undefined) {
        const id = nodes.length;
        const under = node === 0 ? "the root" : q(nodes[node].ch);
        nodes.push({ id, ch, parent: node, isWord: false });
        createdBy.set(id, word);
        node = id;
        push(
          id,
          "new",
          w,
          c,
          id,
          null,
          null,
          [7, 8, 9],
          `${q(ch)} isn’t under ${under} yet. Add a new node.`,
          `Inserting ${qq(word)}, letter ${c + 1} of ${word.length}, ${q(ch)}. New node. Trie has ${count()} nodes.`,
        );
      } else {
        node = existing.id;
        reused++;
        const from = createdBy.get(node) ?? word;
        push(
          node,
          "reuse",
          w,
          c,
          null,
          null,
          null,
          [7, 9],
          `${q(ch)} is already there from ${qq(from)}. Follow it.`,
          `Inserting ${qq(word)}, letter ${c + 1} of ${word.length}, ${q(ch)}. Reused ${reused} ${reused === 1 ? "node" : "nodes"}. Trie has ${count()} nodes.`,
        );
      }
    }
    nodes[node].isWord = true;
    push(
      node,
      "mark",
      w,
      word.length - 1,
      null,
      null,
      null,
      [11],
      `${qq(word)} ends at this ${q(word[word.length - 1])}. Mark it ★.`,
      `${qq(word)} ends at this node. Marked as a word. Trie has ${count()} nodes.`,
    );
  }

  let node = 0;
  let failed = false;
  for (let c = 0; c < query.length; c++) {
    const ch = query[c];
    const next = childOf(node, ch);
    if (next === undefined) {
      failed = true;
      const under = node === 0 ? "the root" : q(nodes[node].ch);
      const result = { search: false, startsWith: false };
      push(
        node,
        "fail",
        null,
        c,
        null,
        ch,
        result,
        [17, 18],
        `${q(ch)} isn’t under ${under}. ${qq(query)} isn’t in the trie.`,
        `Looking up ${qq(query)}, letter ${c + 1} of ${query.length}, ${q(ch)}. Missing. search is false, startsWith is false.`,
      );
      break;
    }
    node = next.id;
    push(
      node,
      "walk",
      null,
      c,
      null,
      null,
      null,
      [16, 17, 19],
      `Look up ${q(ch)}: it’s there. Follow it.`,
      `Looking up ${qq(query)}, letter ${c + 1} of ${query.length}, ${q(ch)}. Found it. Trie has ${count()} nodes.`,
    );
  }

  if (!failed) {
    const found = nodes[node].isWord;
    const marked = found ? "a marked" : "an unmarked";
    push(
      node,
      "verdict",
      null,
      query.length - 1,
      null,
      null,
      { search: found, startsWith: true },
      [21],
      `${qq(query)} ends on ${marked} node. search is ${found}, startsWith is true.`,
      `${qq(query)} ends on ${marked} node. search is ${found}, startsWith is true.`,
    );
  }

  const last = out[out.length - 1].state.result ?? { search: false, startsWith: false };
  push(
    node,
    "done",
    null,
    null,
    null,
    null,
    last,
    [21],
    `Done. search(${qq(query)}) is ${last.search} and startsWith(${qq(query)}) is ${last.startsWith}.`,
    `Done. search(${qq(query)}) is ${last.search} and startsWith(${qq(query)}) is ${last.startsWith}. Trie has ${count()} nodes.`,
  );
  return out;
}
