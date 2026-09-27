# 15 · Intervals — Merge Intervals

- **Visualizer id:** `merge-intervals` · **Folder:** `visualizers/merge-intervals/`
- **Title:** "Merge Intervals"
- **Story:** sort by start, then walk once. Each interval either overlaps the last merged one and stretches it, or starts a new one.

## Input
- `inputLabel`: `intervals =` · `inputMaxLength`: 40
- `inputHint`: `1–6 intervals like 1-3, with 0 ≤ start ≤ end ≤ 20, separated by spaces.`
- Presets and expected answers:
  - `1-3 2-6 8-10 15-18` → `[[1, 6], [8, 10], [15, 18]]`
  - `1-4 4-5` → `[[1, 5]]` (touching counts as overlapping)
  - `1-4 0-4` → `[[0, 4]]` (shows why sorting comes first)

## Reference solution
```ts
function merge(intervals: number[][]): number[][] {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const [start, end] = intervals[i];
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}
```

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 0 | Here are the intervals as bars on a number line. |
| sort | 1 | Sort them by where they start. |
| seed | 2 | The first one starts the merged list: [1, 3]. |
| stretch | 3, 4, 5, 6, 7 | [2, 6] starts at 2, inside [1, 3]. Stretch it to [1, 6]. |
| new | 3, 4, 5, 6, 9 | [8, 10] starts after 6. Start a new merged interval. |
| done | 12 | Done. 3 merged intervals: [1, 6], [8, 10] and [15, 18]. |

The sort is stable (equal starts keep their input order). Sort is one step even if nothing moves: say "Already sorted by start."
`sr` example: `Merged so far: 1 to 6. Looking at 8 to 10, which starts after 6. Merged count 2.`
State: `{ intervals: { id, start, end }[] (current order), sorted: boolean, i, merged: { start, end }[], outcome: "stretch" | "new" | null }`.

## View
- **Number line** 0–20 across the view (SVG or CSS): minor ticks every unit, labels at 0, 5, 10, 15 and 20.
- **Input lanes:** each interval is a bar in its own row (height 28, radius 8, `--card`, 2px border, label `1–3` in mono). Keyed by input id,
  so the sort **slides rows** into their new order (`--dur-slow`). The current interval is orange and lifted. Processed intervals become past/dashed,
  with `→ merged` or `→ new` as a text label at the row end.
- **Merged lane** under a divider: merged bars in mint with ✓. The last merged bar is `range` (tint-yellow) while it can still grow, and its width animates when it stretches.
  A thin vertical guide from the current bar's start down to the merged lane shows the `start ≤ last end` check.
- **Stats:** `current` · `last merged` · answer tile `merged` (count, then the list at the end).

## Tests: brute force
Repeatedly merge any two overlapping intervals (`a.start ≤ b.end && b.start ≤ a.end`) until none overlap, then sort by start and compare.

## Content direction
- Analogy seed: a shared calendar. Lay every meeting on one day's timeline in start order, and back-to-back or overlapping meetings fuse into one busy block.
- `needs`: sorting, arrays. `complexity`: `O(n log n)`.
- Problems: insert-interval, merge-intervals (visualized), non-overlapping-intervals, meeting-rooms (warm-up), meeting-rooms-ii.
