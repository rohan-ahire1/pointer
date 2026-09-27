# Questions for the spec authors (content builder, batch B)

## 09-heaps: balance invariants can't hold on the push step

The spec (`09-heaps.md`, "Tests: brute force") asks for all four heap
invariants on **every** step: valid max-heap, valid min-heap,
`max(low) ≤ min(high)`, and sizes within 1. But the `push low` step sits
between `low.push(num)` (line 5) and the balancing move (line 6), so the new
number can be bigger than everything in the upper half and the lower half can
be two ahead until the move lands. The test checks heap shape on every step
and the two balance invariants on every step except `push`/`setup`.
