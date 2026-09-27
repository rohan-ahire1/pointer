# 06 · Linked List — Reverse Linked List

- **Visualizer id:** `reverse-linked-list` · **Folder:** `visualizers/reverse-linked-list/`
- **Title:** "Reverse Linked List"
- **Story:** the nodes never move. Only the arrows flip, one at a time, and you must hold on to the rest of the list before you cut it.

## Input
- `inputLabel`: `head =` · `inputMaxLength`: 30
- `inputHint`: `1–7 numbers from -99 to 99, separated by spaces.`
- Presets and expected answers (the reversed list):
  - `1 2 3 4 5` → `5 4 3 2 1`
  - `1 2` → `2 1`
  - `7` → `7`

## Reference solution
```ts
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
```

## Steps (3 per node)
| Moment | lines | note (example) |
|---|---|---|
| setup | 1, 2 | prev starts at nothing, curr at the head, 1. |
| save | 3, 4 | Hold on to the rest of the list first: next is 3. |
| flip | 5 | Point 2 back at 1. That arrow now runs the other way. |
| advance | 6, 7 | Step forward: prev is 2, curr is 3. |
| done | 9 | Done. prev is the new head: 5 → 4 → 3 → 2 → 1. |

`sr` example: `Reversed so far: 2, 1. prev at 2, curr at 3, next at 4. Still to go: 3, 4, 5.`
State: `{ values, next: (number | null)[] (each node's next index), prev: number | null, curr: number | null, nxt: number | null }`.

## View
- Nodes stay in their original left-to-right order: 56×56 boxes (`--card`, border, radius 13) with the value, and a `∅` null box at each end (dashed past style).
- **Arrows** live in the gaps between neighbours (SVG or CSS). Gap `k` shows `→` if node k points to k+1, `←` if node k+1 points to k, or nothing.
  The first node's `next = null` after its flip is drawn as a short `←` into the left `∅`. On a flip, the old arrow fades out and the new one draws in (stroke-dashoffset or scale-x) over `--dur-slow`.
- The node whose arrow is changing is lifted orange on `flip` steps. Reversed nodes (already flipped) are `found` (mint ✓).
- Pointer tags under nodes (or under a `∅`): `prev` (inverse), `curr` (orange), `next` (lilac).
- A second row reads the list the way the code sees it: `head → 1 → ∅` / `prev → 2 → 1 → ∅`, updated each step.
- **Stats:** `prev` · `curr` · `next` (`∅` for null) · answer tile `new head`.

## Tests: brute force
Follow `next` from the returned `prev` in the final state and compare with `[...values].reverse()`. Also assert no step ever loses a node (every node is reachable from `prev` or from `curr`).

## Content direction
- Analogy seed: a treasure hunt where each clue says where the next one is. To run the hunt backwards you rewrite one clue at a time, keeping a finger on the next clue before you overwrite it.
- `needs`: pointers, references. `complexity`: `O(n)`.
- Problems: reverse-linked-list (visualized), merge-two-sorted-lists, linked-list-cycle, reorder-list, remove-nth-node-from-end-of-list, merge-k-sorted-lists.
