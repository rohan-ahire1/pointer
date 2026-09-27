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

## 07-trees — "children of a missing node are skipped" reads as heap parsing

The spec says both "LeetCode serialization" and "children of a missing node
are skipped". Real LeetCode parsing is queue-based: tokens flow to the next
live node, so `"1 null 2 3 4"` gives 2 two children. Heap parsing with
skipping instead drops the 3 and 4 (slots under the missing position 2).

The explicit sentence wins over the name: token index i sits at heap position
i + 1, and a value counts only when its parent slot holds a node. Canonical
serializations of real trees parse identically under both readings, so this
only bites on hand-typed oddities. A test locks it: `"1 null 2 3 4"` parses
to just 1 with a right child 2.

Follow-up the spec may want to settle: skipped tokens are silently dropped.
An alternative is rejecting them ("position 4 sits under a missing node"),
which would be friendlier but is extra behaviour the spec doesn't ask for.
