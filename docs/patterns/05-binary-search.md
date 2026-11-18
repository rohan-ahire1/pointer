# 05 · Binary Search — Find Minimum in Rotated Sorted Array

- **Visualizer id:** `find-min-rotated` · **Folder:** `visualizers/find-min-rotated/`
- **Title:** "Find Minimum in Rotated Sorted Array"
- **Story:** compare the middle with the right end. That single comparison tells you which half holds the drop, so the other half goes.

## Input
- `inputLabel`: `nums =` · `inputMaxLength`: 40
- `inputHint`: `1–10 different numbers from -99 to 99, sorted then rotated, like 4 5 6 1 2 3.`
- `parseInput` rejects duplicates and anything that isn't a rotation of an ascending list, with that hint as the error copy.
- Presets and expected answers:
  - `4 5 6 7 0 1 2` → `0`
  - `3 4 5 1 2` → `1`
  - `11 13 15 17` → `11`

## Reference solution
```ts
function findMin(nums: number[]): number {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > nums[hi]) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return nums[lo];
}
```

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 1 | The minimum is somewhere in all 7 numbers. lo at 0, hi at 6. |
| probe | 2, 3, 4 | mid is index 3, value 7. Compare it with the right end, 2. |
| go right | 5 | 7 > 2, so the drop is right of mid. Rule out index 0 to 3. |
| go left | 7 | 1 ≤ 2, so the minimum is mid or left of it. Rule out everything after mid. |
| done | 10 | Done. lo and hi meet at index 4. The minimum is 0. |

`sr` example: `Search space index 4 to 6, 3 numbers. mid at 5, value 1, compared with 2 at hi.`
State: `{ nums, lo, hi, mid: number | null, compare: ">" | "<=" | null, ruledOut: number[] }`.

## View
- **Strip** with a **capsule** over `lo..hi` (the search space) that shrinks and slides (`--dur-slow`). Cells outside it are ruled out (dashed past).
- `mid` cell is `current` (orange, lifted). Tags: `lo` (inverse), `mid` (orange), `hi` (lilac). When two tags share a cell, stack them in the tag row.
- A **comparison chip** floats between `mid` and `hi` on probe steps: `7 > 2` or `1 ≤ 2`, mono, `--card` with a border.
- A **halving trail** under the strip: `7 → 3 → 2 → 1` for the first preset, the size of the search space after each decision. This is the log n story, so keep it visible.
- **Stats:** `search space` · `mid value` · answer tile `minimum`.

## Tests: brute force
`Math.min(...nums)`. The generator builds a sorted distinct list and rotates it by a random amount.

## Content direction
- Analogy seed: finding a word in a paper dictionary. Open the middle, see which side the word is on, and never look at the other side again.
- `needs`: arrays, sorted order. `complexity`: `O(log n)`.
- Problems, in three sections:
  - Find a position: binary-search (704), search-a-2d-matrix (74), find-first-and-last-position-of-element-in-sorted-array (34), find-peak-element (162).
  - Rotated arrays: find-minimum-in-rotated-sorted-array (153, visualized), search-in-rotated-sorted-array (33, `search-rotated`).
  - Search on the answer: koko-eating-bananas (875, `koko-eating-bananas`), split-array-largest-sum (410), median-of-two-sorted-arrays (4).
- Problems outside the Blind 75 have worked solutions in `content/solutions.ts`, tested against brute force.

## Second visualizer: Koko Eating Bananas (search on the answer)
- **Visualizer id:** `koko-eating-bananas` · **Input:** `piles | h`, 1–6 piles of 1–30 bananas, h from the pile count to 99.
- **Story:** nothing in the input is sorted. The possible answers are: if speed k is fast enough, every faster speed is too, so the yes/no flips once and binary search applies to the speeds.
- Presets: `3 6 7 11 | 8` → 4 (LeetCode example), `30 11 23 4 20 | 6` → 23, `5 9 2 | 9` → 2.
- Steps per round: `guess` (lines 2–3, pick k = middle of lo..hi), `count` (lines 4–5, hours per pile summed), `narrow` (line 6 `hi = k` or line 7 `lo = k + 1`). Then `done` on `return lo`.
- **View:** a strip of every speed 1..max(piles) with the capsule over lo..hi and `lo`/`k`/`hi` tags, and a strip of piles with the hours each takes at k above it. Stats: hours of h, verdict, answer tile `speed`.
- **Tests:** brute force tries every speed from 1 up; the trace must also keep the answer inside lo..hi on every step.
