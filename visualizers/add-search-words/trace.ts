import type { Step } from "../types";
import { q, qq } from "../kit";
import type { AddSearchInput, AddSearchState, TrieNodeData } from "./types";

/**
 * Traced Design Add and Search Words: add every word to a trie (reusing nodes
 * already there), then search the pattern depth first. A letter follows one
 * child; a "." tries every child in turn, and a branch that runs out is marked
 * dead before the search backs up. Pure and deterministic.
 */
export function trace(input: AddSearchInput): Step<AddSearchState>[] {
  const { words, pattern } = input;
  const out: Step<AddSearchState>[] = [];
  const nodes: TrieNodeData[] = [{ id: 0, ch: "", parent: null, isWord: false }];
  const dead = new Set<number>();
  const createdBy = new Map<number, string>();
  const kidsOf = (id: number): TrieNodeData[] => nodes.filter((node) => node.parent === id);
  const childOf = (id: number, ch: string): TrieNodeData | undefined =>
    nodes.find((node) => node.parent === id && node.ch === ch);
  const under = (id: number): string => (id === 0 ? "the root" : q(nodes[id].ch));
  const count = () => nodes.length - 1;

  const push = (
    cursor: number | null,
    phase: AddSearchState["phase"],
    wordIndex: number | null,
    charIndex: number | null,
    created: number | null,
    missing: string | null,
    result: boolean | null,
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        words: [...words],
        pattern,
        nodes: nodes.map((node) => ({ ...node })),
        cursor,
        phase,
        wordIndex,
        charIndex,
        created,
        missing,
        dead: [...dead],
        result,
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
    `Empty trie, just a root node. ${words.length} ${words.length === 1 ? "word" : "words"} to add, then search ${qq(pattern)}.`,
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
        const parent = under(node);
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
          `${q(ch)} isn’t under ${parent} yet. Add a new node.`,
          `Adding ${qq(word)}, letter ${c + 1} of ${word.length}, ${q(ch)}. New node. Trie has ${count()} nodes.`,
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
          `Adding ${qq(word)}, letter ${c + 1} of ${word.length}, ${q(ch)}. Reused ${reused} ${reused === 1 ? "node" : "nodes"}. Trie has ${count()} nodes.`,
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

  push(
    0,
    "start",
    null,
    null,
    null,
    null,
    null,
    [27],
    `Now search ${qq(pattern)}, starting at the root.`,
    `Adding is done. Searching ${qq(pattern)} from the root. Trie has ${count()} nodes.`,
  );

  /**
   * The nodes on the way down from the root. `remaining` is how many sibling
   * children a "." still has to try after the one being explored.
   */
  const stack: { node: number; remaining: number }[] = [];

  /** Marks every node that has run out of options; true if a branch is still left to try. */
  const markDead = (): boolean => {
    for (let k = stack.length - 1; k >= 0; k--) {
      if (stack[k].remaining > 0) return true;
      dead.add(stack[k].node);
    }
    return false;
  };

  const dfs = (node: number, i: number): boolean => {
    const frame = { node, remaining: 0 };
    stack.push(frame);
    const found = visit(node, i, frame);
    stack.pop();
    return found;
  };

  const visit = (node: number, i: number, frame: { node: number; remaining: number }): boolean => {
    if (i === pattern.length) {
      if (nodes[node].isWord) {
        push(
          node,
          "found",
          null,
          i - 1,
          null,
          null,
          true,
          [16],
          `The pattern is used up and this node is a ★ word. Found.`,
          `Pattern ${qq(pattern)} used up on a marked word node. Found.`,
        );
        return true;
      }
      const more = markDead();
      push(
        node,
        "dead",
        null,
        i - 1,
        null,
        null,
        null,
        [16],
        `The pattern is used up, but no word ends here. Dead end.${more ? " Back up." : ""}`,
        `Pattern ${qq(pattern)} used up on a node that isn’t a word. Dead end.${more ? " Backing up to try another branch." : " No branches left."}`,
      );
      return false;
    }

    const ch = pattern[i];
    const where = under(node);
    if (ch === ".") {
      const kids = kidsOf(node);
      if (kids.length === 0) {
        const more = markDead();
        push(
          node,
          "dead",
          null,
          i,
          null,
          null,
          null,
          [18, 19, 22],
          `‘.’ needs a child, but ${where} has none. Dead end.${more ? " Back up." : ""}`,
          `Pattern letter ${i + 1} is a dot. ${where === "the root" ? "The root" : `Node ${where}`} has no children. Dead end.${more ? " Backing up to try another branch." : " No branches left."}`,
        );
        return false;
      }
      for (let k = 0; k < kids.length; k++) {
        const kid = kids[k];
        frame.remaining = kids.length - k - 1;
        push(
          kid.id,
          "wild",
          null,
          i,
          null,
          null,
          null,
          [18, 19, 20],
          k === 0
            ? `‘.’ matches any letter. Try ${q(kid.ch)} first.`
            : `Back at ${where}. Try the next child, ${q(kid.ch)}.`,
          `Pattern letter ${i + 1} is a dot. Trying child ${q(kid.ch)} under ${where}, ${k + 1} of ${kids.length}.`,
        );
        if (dfs(kid.id, i + 1)) return true;
      }
      return false;
    }

    const next = childOf(node, ch);
    if (next === undefined) {
      const more = markDead();
      push(
        node,
        "dead",
        null,
        i,
        null,
        ch,
        null,
        [24, 25],
        `${q(ch)} isn’t under ${where}. Dead end.${more ? " Back up." : ""}`,
        `Pattern letter ${i + 1} is ${q(ch)}. Not under ${where}. Dead end.${more ? " Backing up to try another branch." : " No branches left."}`,
      );
      return false;
    }
    push(
      next.id,
      "walk",
      null,
      i,
      null,
      null,
      null,
      [17, 24, 25],
      `${q(ch)} is there. Follow it.`,
      `Pattern letter ${i + 1} is ${q(ch)}. Found it under ${where}. Following it.`,
    );
    return dfs(next.id, i + 1);
  };

  const result = dfs(0, 0);
  const cursor = out[out.length - 1].state.cursor;
  const verdict = result ? "true" : "false";
  push(
    cursor,
    "done",
    null,
    null,
    null,
    null,
    result,
    [27],
    `Done. search(${qq(pattern)}) is ${verdict}.`,
    `Done. search(${qq(pattern)}) is ${verdict}. Trie has ${count()} nodes.`,
  );
  return out;
}
