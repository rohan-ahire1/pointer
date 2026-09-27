# 04 · Stack — Valid Parentheses

- **Visualizer id:** `valid-parentheses` · **Folder:** `visualizers/valid-parentheses/`
- **Title:** "Valid Parentheses"
- **Story:** every opener waits on a stack of plates; every closer must match the plate on top.

## Input
- `inputLabel`: `s =` · `inputMaxLength`: 12
- `inputHint`: `Up to 12 brackets: ( ) [ ] { }. Anything else is ignored.`
- Presets and expected answers:
  - `()[]{}` → `true`
  - `{[()]}` → `true`
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
- Problems: valid-parentheses (visualized). It's the only one, so its twist is the "watched" line.
