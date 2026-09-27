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
