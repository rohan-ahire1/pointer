# 04 · Stack — Valid Parentheses

- **Visualizer id:** `valid-parentheses` · **Folder:** `visualizers/valid-parentheses/`
- **Title:** "Valid Parentheses"
- **Story:** every opener waits on a stack of plates; every closer must match the plate on top.

## Input
- `inputLabel`: `s =` · `inputMaxLength`: 12
- `inputHint`: `Up to 12 brackets: ( ) [ ] { }. Anything else is ignored.`
- Presets and expected answers:
  - `{[()]}` → `true` (the explainer's example: nesting fills the stack three deep)
  - `()[]{}` → `true`
  - `([)]` → `false`

## Reference solution
```ts
function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  for (const ch of s) {
    if (!(ch in pairs)) {
      stack.push(ch);
    } else if (stack.pop() !== pairs[ch]) {
      return false;
    }
  }
  return stack.length === 0;
}
```

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 1, 2 | Start with an empty stack. |
| push | 3, 4, 5 | ‘(’ opens. Put it on top of the stack. |
| match | 3, 6 | ‘)’ closes, and the top is ‘(’. They match, so take it off. |
| mismatch | 6, 7 | ‘)’ closes, but the top is ‘[’. Mismatch, so the string is invalid. |
| empty pop | 6, 7 | ‘)’ closes, but the stack is empty. Nothing to match. |
| done | 7 or 10 | Done. The stack is empty, so every bracket found its partner. / Done. ‘(’ is still waiting, so it’s invalid. |

`sr` example: `Reading position 3, ‘)’. Stack from bottom: [, (. Top matches.`
State: `{ s, i, stack: { ch, from: number }[], matched: number[] (indices of settled chars), verdict: null | boolean, event }`.

## View
- **Input strip** of the brackets. Tag `i` (orange) under the current one. Settled pairs turn `found` (mint ✓) — both the opener and its closer.
  The mismatching closer gets a `✕` badge and stays orange.
- **The stack of plates** beside the strip on desktop, under it on phones: a column, bottom plate at the bottom. Each plate is 96×40,
  `--card`, 2px border, radius 12, with the bracket in mono 22px and a small `from 2` index. The top plate carries a `top` tag (inverse).
  Push: the plate drops in from 24px above and fades in. Pop: it lifts 24px and fades out. Key plates by `from`, not by position.
  Empty stack: a dashed outline plate reading `empty`. Reserve room for 12 plates so the layout never jumps (or cap the visible column at 6 with a `+n` chip underneath).
- **Stats:** `reading` · `stack depth` · answer tile `valid?` (`…`, `yes ✓`, `no ✕`).

## Tests: brute force
Repeatedly delete `()`, `[]` and `{}` until the string stops changing; valid means it ends empty.

## Content direction
- Stack already has an approved analogy (plates). Keep it verbatim.
- `needs`: strings, arrays. `complexity`: `O(n)`.
- Problems, in three sections:
  - **Matching pairs:** valid-parentheses (visualized, so its twist is the "watched" line).
  - **Parsing:** decode-string, basic-calculator-ii.
  - **Monotonic stack:** daily-temperatures (`daily-temperatures` visualizer), largest-rectangle-in-histogram,
    trapping-rain-water (`trapping-rain-water` visualizer), sliding-window-maximum (a monotonic deque).
- Problems beyond the Blind 75 carry a worked solution in `content/solutions.ts`.

---

# 04b · Stack — Trapping Rain Water

- **Visualizer id:** `trapping-rain-water` · **Folder:** `visualizers/trapping-rain-water/`
- **Story:** bars wait on a falling stack. A taller bar pops the dip on top, and the bar under it is the left wall, so each pop pours one flat layer of water.

## Input
- `inputLabel`: `height =` · `inputMaxLength`: 40 · `inputHint`: `2–12 bar heights from 0 to 9.`
- Presets and expected answers:
  - `0 1 0 2 1 0 1 3 2 1 2 1` → `6` (LeetCode's example)
  - `4 2 0 3 2 5` → `9`
  - `3 2 1 2 3` → `4` (two layers poured over the same dip)

## Steps
| Moment | lines | note (example) |
|---|---|---|
| setup | 1, 2 | The stack holds bars that could still be the left wall of a pool. |
| read | 3, 4 | Bar 3 is 2 tall. Is it taller than the bar on top of the stack? |
| fill | 5, 7, 8, 9 | Pop bar 2. Walls 1 and 3 hold 1 deep × 1 wide = 1 unit. |
| runoff | 5, 6 | Pop bar 0. Nothing on its left can hold water, so it runs off. |
| push | 11 | Bar 3 goes on the stack. It could be the left wall of a later pool. |
| done | 13 | Done. 6 units of water are trapped. |

State: `{ height, stack, i, floor, left, layers: { from, to, base, top }[], fresh, water, phase }`.

## View
- Bars as in Container With Most Water, on one baseline. `i` (orange) lifts the current bar; `left` (inverse) and `floor` (lilac) tag the pop.
  Bars on the stack are yellow; settled bars are dashed.
- Every poured layer stays drawn behind the bars, so the water builds up layer by layer. The newest layer has a dashed outline.
- A `stack · top last` chip panel underneath. **Stats:** `bar` · `on stack` · answer tile `water`.

## Tests: brute force
Each bar holds `min(tallest on the left, tallest on the right) − its height`. The layers must add up to exactly that, bar by bar, and never overlap a bar.
