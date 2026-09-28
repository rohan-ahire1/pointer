# 02 · Two Pointers — Container With Most Water

- **Visualizer id:** `container-with-most-water` · **Folder:** `visualizers/container-water/`
- **Title:** "Container With Most Water"
- **Story:** start with the widest container; the shorter wall is the limit, so move it inward. The taller one never needs to move first.

## Input
- `inputLabel`: `height =` · `inputMaxLength`: 30
- `inputHint`: `2–10 wall heights from 0 to 9, separated by spaces.`
- Presets and expected answers:
  - `1 8 6 2 5 4 8 3 7` → `49`
  - `4 3 2 1 4` → `16`
  - `1 1` → `1`

## Reference solution
```ts
function maxArea(height: number[]): number {
  let left = 0, right = height.length - 1;
  let best = 0;
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    best = Math.max(best, h * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return best;
}
```

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 1, 2 | Start with the widest container: the first and last walls. |
| measure | 3, 4, 5 | Walls 1 and 7, 8 apart. Water fills to 1, so the area is 8. Best so far 8. |
| move | 6 or 7 | The left wall is shorter, so move it in. Moving the taller one can never do better. |
| done | 9 | Done. The biggest container holds 49. |

Equal heights move `right` (line 7) — say "Both walls are 5. Move the right one in." `sr` example:
`Left wall at 1, height 8. Right wall at 8, height 7. Width 7, water 7 high, area 49. Best 49.`
State: `{ height, left, right, h, area, best, bestPair: [number, number] | null, phase: "measure" | "move" }`.

## View
- **Bar chart** instead of cells: one column per wall, same width as a cell, height `value × 16px` (max 144px), value label on top, index under it.
  Bars inside `[left, right]` are `--card` with a solid border; bars outside are ruled out (`--past-bg`, dashed `--past-line`, `--faint` label).
- **Water:** a rectangle from the left bar to the right bar, height `h` units, `--sky` fill, with `area 8` centred in `--on-accent` mono text.
  It animates width/height/left (`--dur-slow`). When the area is a new best, add a `★ best` label.
- The **best container so far** stays drawn as a dashed `--pen` outline so the learner can compare.
- Pointer tags `L` (inverse) and `R` (orange) under the two walls. On a `move` step, the wall about to move is lifted (orange).
- **Stats:** `width` · `water height` · `area` · answer tile `best`.

## Tests: brute force
Max over all pairs `i < j` of `min(h[i], h[j]) × (j − i)`.

## Content direction
- Analogy seed: two people starting at opposite ends of a hallway and walking toward each other, each step ruling out a whole row of options.
- `needs`: arrays. `complexity`: `O(n)`.
- Problems: valid-palindrome (warm-up), 3sum, container-with-most-water (visualized).
