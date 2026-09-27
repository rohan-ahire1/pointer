# Questions for the spec authors (content builder)

Closest-faithful calls made while implementing. Specs themselves are untouched.

## 06-linked-list — reachability check omits `next`

The spec's Tests section says: "Also assert no step ever loses a node (every
node is reachable from `prev` or from `curr`)."

On a `flip` step the tail hangs only off the saved `next` pointer: `curr.next`
has just been repointed at `prev`, so nodes after `curr` are reachable from
`nxt` but from neither `prev` nor `curr`. Holding the tail in `next` before
the cut is the spec's own story ("you must hold on to the rest of the list
before you cut it"), so the trace is faithful — the parenthetical just omits
the third holder.

Implemented: the test asserts every node is reachable from `prev`, `curr` or
`nxt` on every step. If the intent was the literal two-pointer version, the
`flip` step would have to show pre-flip arrows, contradicting the View section
("Reversed nodes (already flipped) are `found`").

## 07-trees — "children of a missing node are skipped" [resolved: queue parsing]

The spec says both "LeetCode serialization" and "children of a missing node
are skipped". Real LeetCode parsing is queue-based: tokens flow to the next
live node, so `"1 null 2 3"` gives 2 a left child 3.

Resolved: the spec means real LeetCode level-order parsing (queue-based).
"Children of a missing node are skipped" describes how the serialization
omits them, not heap slots. `parseInput` now parses queue-style (first token
is the root, then two tokens per live node in BFS order), derives each
node's heap `pos` and `depth` from the structure, and rejects leftover
tokens that have no parent to attach to.

---

# Batch B (patterns 08–15)

## 09-heaps: balance invariants can't hold on the push step

The spec (`09-heaps.md`, "Tests: brute force") asks for all four heap
invariants on **every** step: valid max-heap, valid min-heap,
`max(low) ≤ min(high)`, and sizes within 1. But the `push low` step sits
between `low.push(num)` (line 5) and the balancing move (line 6), so the new
number can be bigger than everything in the upper half and the lower half can
be two ahead until the move lands. The test checks heap shape on every step
and the two balance invariants on every step except `push`/`setup`.
