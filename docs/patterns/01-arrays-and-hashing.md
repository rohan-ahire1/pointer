# 01 · Arrays & Hashing — Two Sum with a hash map

- **Visualizer id:** `two-sum-hash-map` · **Folder:** `visualizers/two-sum/`
- **Title:** "Two Sum"
- **Story:** walk the array once; for each number ask the map "have I already seen the partner I need?"

## Input
- `inputLabel`: `nums | target =` · `inputMaxLength`: 40
- `inputHint`: `2–8 whole numbers from -99 to 99, then | and the target.`
- Format: numbers separated by spaces or commas, a `|`, then the target. Target range -198..198.
- Presets and expected answers:
  - `1 6 2 4 5 | 9` → `[3, 4]` (the explainer's example: brute force only finds it on the last pair)
  - `2 7 11 15 | 9` → `[0, 1]`
  - `3 2 4 | 6` → `[1, 2]`
  - `3 3 | 6` → `[0, 1]`
- No pair is a valid outcome for the visualizer (not on LeetCode): answer `[]`.

## Reference solution (`code.ts`, one string per line)
```ts
function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {
      return [seen.get(need)!, i];
    }
    seen.set(nums[i], i);
  }
  return [];
}
```

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 1 | Start with an empty map. It will remember each number’s index. |
| read i | 2, 3 | i reaches 7. You need 9 − 7 = 2. |
| hit | 4, 5 | 2 is in the map at index 0. Found the pair. |
| miss | 4, 7 | 2 isn’t in the map yet. Remember 7 at index 1. |
| done | 5 or 9 | Done. nums[0] + nums[1] = 9, so the answer is [0, 1]. / Done. No two numbers add up to 9. |

`sr` example: `i at 1, value 7. Need 2. Map holds 2 at 0. Pair found: 0 and 1.`
State: `{ nums, target, i, need, map: { value, index }[] (insertion order), lookup: "none" | "hit" | "miss", answer: number[] | null }`.

## View
- **Strip** of `nums` with the index in small mono text above each cell (`--muted`). Pointer tag `i` (orange) under the current cell.
- Current cell: `current` (orange, lifted). Cells already stored in the map: plain. On a hit, both cells become `found` (mint ✓) with tags `seen` (inverse) and `i` (orange).
- **Map panel** beside the strip on desktop, under it on phones: a titled box `map` (card, 2px border, radius 18) holding chips `7 → 1` in insertion order. New chips scale in. On a lookup, a **probe chip** `need 2?` appears next to the panel title:
  hit → the matching chip turns mint ✓ and the probe shows `✓ found`; miss → the probe is dashed with `✕ not yet`, then the new chip is added.
- **Stats:** `nums[i]` · `need` · answer tile `pair` (`—` until found, then `[0, 1]`, or `none`).

## Tests: brute force
Assert the answer is valid: two distinct indices `j < i`, `nums[j] + nums[i] === target`; and `[]` exactly when a double loop finds no pair.

## Content direction (Muse writes the copy)
- Analogy seed: a coat check. You hand over a coat, get a ticket, and later find it instantly without searching the rack.
- `needs`: arrays, hash maps. `complexity`: `O(n)`.
- Problems: contains-duplicate, valid-anagram (warm-ups), two-sum (visualized), group-anagrams, top-k-frequent-elements, encode-and-decode-strings, product-of-array-except-self, longest-consecutive-sequence.
