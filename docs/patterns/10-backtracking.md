# 10 · Backtracking — Combination Sum

- **Visualizer id:** `combination-sum` · **Folder:** `visualizers/combination-sum/`
- **Title:** "Combination Sum"
- **Story:** try a number, recurse, undo. Because candidates are sorted, one number that's too big means everything after it is too, so the whole branch is cut.

## Input
- `inputLabel`: `candidates | target =` · `inputMaxLength`: 30
- `inputHint`: `2–4 different numbers from 2 to 9, then | and a target from 1 to 10.`
- Limits exist to keep the tree small. If the property test finds inputs over the 150-step budget, lower the target cap, and note it in QUESTIONS.md.
- Presets and expected answers (combinations in the order found):
  - `2 3 6 7 | 7` → `[[2, 2, 3], [7]]`
  - `2 3 5 | 8` → `[[2, 2, 2, 2], [2, 3, 3], [3, 5]]`
  - `3 5 | 4` → `[]`

## Reference solution
```ts
function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  const path: number[] = [];
  candidates.sort((a, b) => a - b);
  function dfs(start: number, remaining: number) {
    if (remaining === 0) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break;
      path.push(candidates[i]);
      dfs(i, remaining - candidates[i]);
      path.pop();
    }
  }
  dfs(0, target);
  return result;
}
```

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 1, 2, 3, 16 | Sort the candidates. Start with an empty path. You need 7. |
| try | 9, 11, 12 | Try 2. Path [2, 2], still need 3. |
| found | 5, 6 | Need 0. [2, 2, 3] works, so save it. |
| prune | 10 | 3 is more than the 1 left. Everything after it is bigger too, so cut here. |
| done | 17 | Done. 2 combinations: [2, 2, 3] and [7]. |

**Pops aren't their own steps.** When the path shrinks, the next `try` or `prune` note starts with `Back to [2]. `. Keep notes ≤ 110 characters.
`sr` example: `Path 2, 2, 3. Remaining 0. Found 1 combination so far. Tree has 6 tried branches, 2 cut.`
State: `{ candidates (sorted), target, path, remaining, tree: { id, parent, pick, remaining, status: "open" | "path" | "found" | "cut" | "done" }[], current: id, results: number[][] }`.

## View
- **Decision tree** (SVG, `viewBox`, width 100%). The root shows the target. Each child edge is labelled with the number picked, and each node shows what's still needed.
  Nodes appear as they're tried (scale in). States: current (orange) · on the current path (`range`, tint-yellow) · found (mint, `✓ 0`) · cut (dashed past + `✂`, plus the too-big number) · explored (plain card).
  Tidy layout with keyed nodes, so relayouts slide.
- **Sum bar** under the tree: the target as a row of unit squares. The path's numbers fill it as labelled segments (`2`, `2`, `3`), and the remainder is dashed.
  This makes "need 3 more" visual.
- **Results** row: found combinations as mint chips with ✓.
- **Stats:** `path` · `remaining` · answer tile `found` (count, then the list at the end).

## Tests: brute force
Independently enumerate all non-decreasing sequences of candidates that sum to the target (plain recursion over counts), sort both lists and compare. Assert the step budget.

## Content direction
- Analogy seed: a maze explored with chalk. Walk until you hit a wall, step back to the last fork, and never walk the same dead end twice.
- `needs`: recursion, arrays. `complexity`: `"Exponential"` (the hero meta shows it as text; don't invent a precise bound).
- Problems: combination-sum (visualized), word-search.
