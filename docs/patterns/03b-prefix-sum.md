# 03b · Prefix Sum — Subarray Sum Equals K

- **Visualizer id:** `subarray-sum-k` · **Folder:** `visualizers/subarray-sum-k/`
- **Title:** "Subarray Sum Equals K"
- **Story:** keep a running total. A subarray that ends here sums to k exactly when an earlier running total was
  `prefix − k`, so a hash map of the totals seen so far answers the question in one lookup.

## Input
- `inputLabel`: `nums | k =`
- Format: `nums | k`, space-separated integers (negatives allowed).
- Presets and expected answers:
  - `3 4 7 2 -3 1 4 2 | 7` → `4` (LeetCode-style example; video preset)
  - `1 1 1 | 2` → `2` (LeetCode example 1)
  - `1 -1 0 | 0` → `3` (zeros and negatives: why the map counts, not just marks)

## Reference solution
`visualizers/subarray-sum-k/code.ts`: a `Map` seeded with `0 → 1` (the empty prefix), one loop that adds `x`, adds
`seen.get(prefix - k) ?? 0` to the count, then stores the prefix. Lookup comes before store, so a subarray is never empty.

## Steps
| Phase | When | note (example) |
|---|---|---|
| setup | start | Count subarrays that add up to 7. The map starts with 0 once, for the empty prefix. |
| look | each number | Add 4: the prefix is 7. 7 − 7 = 0 was seen once, so count is 1. |
| store | after each look | Store prefix 7. The map has now seen it once. |
| done | end | Done. 4 subarrays add up to 7. |

State: `{ nums, k, i, prefix, need, hits, count, seen: {sum, times}[], prefixes, found: [a, b][], phase }`.
`found` lists the subarrays that end at `i` on a look step, so the view can outline them.

## Tests: brute force
`trace.test.ts` checks every preset and random inputs against a double loop over all subarrays, and checks the
`found` runs on each look step really sum to k.

## Explainer video
`prefix-sum` in `components/Lesson/LessonWatch/animation/PatternVideo.tsx`, stage in `stages-prefix.tsx`. Beat 1 shows
the brute force (sum every subarray: 36 sums for 8 numbers), beats 2–4 play the traced steps with a running-total row
and the map of totals.

## Problems
range-sum-query-immutable (303), subarray-sum-equals-k (560, visualized), contiguous-array (525),
continuous-subarray-sum (523), subarray-sums-divisible-by-k (974).
