# 09 · Heaps — Find Median from Data Stream

- **Visualizer id:** `median-two-heaps` · **Folder:** `visualizers/median-two-heaps/`
- **Title:** "Find Median from Data Stream"
- **Story:** keep the smaller half in a max-heap and the larger half in a min-heap. The median always sits at the tops, where they meet.

## Input
- `inputLabel`: `stream =` · `inputMaxLength`: 40
- `inputHint`: `1–8 numbers from -99 to 99, in the order they arrive.`
- Presets and expected medians after each number (the answer is the last one):
  - `5 15 1 3` → `5, 10, 5, 4`
  - `2 3 4` → `2, 2.5, 3`
  - `6 10 2 6 5 0` → `6, 8, 6, 6, 6, 5.5`

## Reference solution
```ts
class MedianFinder {
  low = new MaxHeap();  // smaller half
  high = new MinHeap(); // larger half

  addNum(num: number) {
    this.low.push(num);
    this.high.push(this.low.pop());
    if (this.high.size() > this.low.size()) {
      this.low.push(this.high.pop());
    }
  }

  findMedian(): number {
    if (this.low.size() > this.high.size()) return this.low.peek();
    return (this.low.peek() + this.high.peek()) / 2;
  }
}
```

## Steps (3–4 per number)
| Moment | lines | note (example) |
|---|---|---|
| setup | 1, 2 | Two empty heaps: the lower half on the left, the upper half on the right. |
| push low | 4, 5 | 15 arrives. Drop it into the lower half first. |
| move up | 6 | The biggest of the lower half, 15, moves over to the upper half. |
| rebalance | 7, 8 | The upper half is bigger now. Its smallest, 5, moves back down. |
| median | 12, 13 or 14 | Median: (5 + 15) / 2 = 10. |
| done | 13 or 14 | Done. After 4 numbers the median is 4. |

Skip the rebalance step when no rebalance happens (include line 7 in the `move up` step instead).
`sr` example: `Lower half 1, 3, top 3. Upper half 5, 15, top 5. Median (3 + 5) / 2 = 4.`
Implement small array heaps inside `trace.ts` (sift up and down) and record each heap as an array of `{ id, value }`, where id is the stream index.
State: `{ stream, index, low: HeapItem[], high: HeapItem[], moving: id | null, medians: number[] }`.

## View
- **Stream strip** on top: numbers still to come (card) · current (orange, lifted) · already added (past, dashed).
- **Two heap trees** side by side (stacked on phones), each drawn from its array: index 0 on top, children 2i+1 and 2i+2, via `treeLayout`.
  Left panel `lower half · max-heap` with a `--tint-lilac` header, right panel `upper half · min-heap` with `--tint-mint`. The tops carry a `top` tag.
- Nodes are keyed by stream id, so a value that moves between heaps or sifts **glides** to its new place (`--dur-slow`).
  The moving node is orange during `move up` and `rebalance` steps.
- A **median marker** between the two tops: `median 10` in the display font on `--yellow`, `--on-accent` text.
- **Stats:** `lower size` · `upper size` · answer tile `median`.

## Tests: brute force
For each prefix of the stream, sort it and take the median; compare the whole `medians` array. Also assert the heap invariants every step: `low` is a valid max-heap, `high` a valid min-heap, `max(low) ≤ min(high)`, and sizes differ by at most 1.

## Content direction
- Analogy seed: a line of people sorted by height, split into two teams at the middle. Each team only watches its member closest to the split.
- `needs`: heaps, sorting. `complexity`: `O(log n)` per number.
- Problems: find-median-from-data-stream (visualized). It's the only one.
