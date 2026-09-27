# 14 · Greedy — Jump Game

- **Visualizer id:** `jump-game` · **Folder:** `visualizers/jump-game/`
- **Title:** "Jump Game"
- **Story:** don't plan the route. Just track the farthest stone you could reach. If you ever stand past it, you're stuck.

## Input
- `inputLabel`: `nums =` · `inputMaxLength`: 30
- `inputHint`: `1–10 jump lengths from 0 to 5, separated by spaces.`
- Presets and expected answers:
  - `2 3 1 1 4` → `true`
  - `3 2 1 0 4` → `false`
  - `0` → `true`

## Reference solution
```ts
function canJump(nums: number[]): boolean {
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}
```

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 1 | You stand on stone 0. So far you can reach stone 0. |
| extend | 2, 3, 4 | Stone 1 lets you jump 3, as far as stone 4. New farthest: 4. |
| no gain | 2, 3, 4 | Stone 3 lets you jump 0. Farthest stays 3. |
| stuck | 2, 3 | Stone 4 is past your farthest reach, 3. You’re stuck. |
| done | 3 or 6 | Done. Every stone was within reach, so you can get to the end. / Done. You can’t get past stone 3. |

`sr` example: `At stone 1, jump 3. Farthest reachable stone 4 of 4. Can reach the end.`
State: `{ nums, i, reach, prevReach, stuckAt: number | null, verdict: null | boolean }`.

## View
- **Strip** of stones: cells with the jump length. A **capsule** spans `0..reach` (the reachable zone) and grows to the right (`--dur-slow`).
  Stones past the reach are plain; checked stones inside the capsule are `range`. The current stone is orange and lifted.
- An **arc** (SVG path above the strip, 2px `--line`, arrowhead) from the current stone to `i + nums[i]`, labelled `+3`.
  If it doesn't extend the reach, the arc is dashed `--past-line`.
- Tags: `i` (orange) under the current stone; `reach` (inverse) under the farthest reachable stone.
- If stuck, that stone becomes past/dashed with a `✕`, and the gap between the reach and it gets a `gap` label.
- **Stats:** `i + nums[i]` · `farthest` · answer tile `reach the end?` (`…`, `yes ✓`, `no ✕`).

## Tests: brute force
BFS or DP over reachable indices from 0.

## Content direction
- Analogy seed: crossing a stream on stepping stones, only caring about how far ahead you could land, never about the exact route.
- `needs`: arrays. `complexity`: `O(n)`.
- Problems: maximum-subarray, jump-game (visualized).
